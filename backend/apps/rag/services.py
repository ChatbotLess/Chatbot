from apps.chat.models import Mensagem, Chat
from apps.base_conhecimento.models import Base_Conhecimento
from .models import ChunkDocumento, MensagemChunk
from apps.rag.rag import Rag
from apps.rag.langsmith_tracing import traceable

from pathlib import Path
import os
import requests
import time
from django.db import DatabaseError

if not hasattr(time, "clock"):
    time.clock = time.perf_counter

try:
    import aiml
except ModuleNotFoundError:
    aiml = None

import time
import warnings

warnings.filterwarnings("ignore", category=SyntaxWarning)


AIML_PATH = Path(__file__).resolve().parent / "perguntas_frequentes.aiml"
CLASSIFICADOR_URL = os.getenv("CLASSIFICADOR_URL", "http://127.0.0.1:8001/classificar")
CLASSIFICADOR_TIMEOUT = float(os.getenv("CLASSIFICADOR_TIMEOUT", "5"))
CLASSIFICADOR_CONFIANCA_MINIMA = float(os.getenv("CLASSIFICADOR_CONFIANCA_MINIMA", "0.70"))

MENSAGEM_SEM_DOCS = (
    "Ainda não há documentos indexados na base de conhecimento. "
    "Por favor, envie um documento antes de fazer perguntas."
)

def _join_stream_chunks(chunks):
    return {"texto": "".join(str(chunk) for chunk in chunks)}


def _omit_stream_input(inputs):
    return {key: value for key, value in inputs.items() if key != "stream"}


def _mensagem_output(mensagem):
    return {
        "mensagem_id": getattr(mensagem, "id", None),
        "role": getattr(mensagem, "role", None),
    }


def _rag_output(_rag_instance):
    return {"status": "rag_inicializado"}


def obter_base_ativa():
    try:
        return Base_Conhecimento.objects.filter(
            status=Base_Conhecimento.StatusBaseDocumento.Ativo
        ).first()
    except DatabaseError:
        return None


def base_ativa_tem_documentos(base=None):
    base = base or obter_base_ativa()

    if base is None:
        return False

    return ChunkDocumento.objects.filter(metadata__base=base.id).exists()


@traceable(name="Classificar intenção", run_type="tool")
def classificar_intencao(pergunta_usuario):
    try:
        response = requests.post(
            CLASSIFICADOR_URL,
            headers={
                "accept": "application/json",
                "Content-Type": "application/json",
            },
            json={"texto": pergunta_usuario},
            timeout=CLASSIFICADOR_TIMEOUT,
        )
        response.raise_for_status()
        payload = response.json()
    except (requests.RequestException, ValueError, TypeError):
        return None

    classificacao = payload.get("classificacao")
    
    if not classificacao:
        return None

    return {
        "classificacao": str(classificacao).strip().upper(),
        "confianca": payload.get("confianca"),
    }


@traceable(name="Salvar mensagem", run_type="tool", process_outputs=_mensagem_output)
def salvar_mensagem(chat_id, role, conteudo, pergunta_original=None, intencao=None, source_nodes=None):
    mensagem = Mensagem(
        chat_id=chat_id,
        role=role,
        conteudo=conteudo,
        pergunta_original=pergunta_original,
        intencao=intencao
    )

    mensagem.save()
    return mensagem


@traceable(name="Salvar metadados dos chunks", run_type="tool")
def salvar_metadados(mensagem, procura_nodes):
    for node in procura_nodes:
        node_id = node.node.node_id
        nome_arquivo = node.node.metadata.get("file_name", "")

        chunk = ChunkDocumento.objects.filter(node_id=node_id).first()

        if chunk:
            MensagemChunk.objects.get_or_create(
                chunk=chunk,
                mensagem=mensagem,
                defaults={"nome_arquivo": nome_arquivo}
            )


@traceable(name="Inicializar RAG", run_type="tool", process_outputs=_rag_output)
def inicializar_rag():
    rag_instance = Rag()
    rag_instance.carregar_llm()
    rag_instance.conectar_indice_existente()

    return rag_instance


class AimlService:
    kernel = None

    @classmethod
    def carregar_kernel(cls):
        if cls.kernel is None:
            if aiml is None:
                return None
            cls.kernel = aiml.Kernel()
            cls.kernel.learn(str(AIML_PATH))

        return cls.kernel

    @classmethod
    @traceable(name="Responder com AIML", run_type="tool")
    def responder(cls, pergunta_usuario):
        kernel = cls.carregar_kernel()
        if kernel is None:
            return None
        pergunta_normalizada = pergunta_usuario.upper()
        resposta = kernel.respond(pergunta_normalizada).strip()

        if not resposta:
            return None

        if "__RAG__" in resposta.split():
            return None

        return resposta


class AimlResposta:
    def __init__(self, pergunta_usuario, chat_id, resposta):
        self.pergunta_usuario = pergunta_usuario
        self.chat_id = chat_id
        self.resposta = resposta

    def stream(self):
        yield from stream_resposta_aiml(
            pergunta_usuario=self.pergunta_usuario,
            chat_id=self.chat_id,
            resposta=self.resposta,
        )


class RagResposta:
    def __init__(self, pergunta_usuario, chat_id):
        self.pergunta_usuario = pergunta_usuario
        self.chat_id = chat_id

    def stream(self):
        yield from stream_resposta_rag(
            pergunta_usuario=self.pergunta_usuario,
            chat_id=self.chat_id,
        )


class AimlCreator:
    def factory_method(self, pergunta_usuario, chat_id):
        resposta_aiml = AimlService.responder(pergunta_usuario)

        if resposta_aiml:
            return AimlResposta(
                pergunta_usuario=pergunta_usuario,
                chat_id=chat_id,
                resposta=resposta_aiml
            )

        return None

class RagCreator:
    def factory_method(self, pergunta_usuario, chat_id):
        return RagResposta(
            pergunta_usuario=pergunta_usuario,
            chat_id=chat_id
        )


@traceable(name="Stream resposta AIML", run_type="chain", reduce_fn=_join_stream_chunks)
def stream_resposta_aiml(pergunta_usuario, chat_id, resposta):
    salvar_mensagem(
        chat_id=chat_id,
        role="assistant",
        conteudo=resposta,
        pergunta_original=pergunta_usuario,
    )

    yield resposta


@traceable(name="Stream resposta RAG", run_type="chain", reduce_fn=_join_stream_chunks)
def stream_resposta_rag(pergunta_usuario, chat_id):
    yield ""

    rag_instance = inicializar_rag()
    intencao = classificar_intencao(pergunta_usuario)
    tipo_documento = None

    if intencao and float(intencao.get("confianca") or 0) > CLASSIFICADOR_CONFIANCA_MINIMA:
        tipo_documento = intencao["classificacao"]
    base = obter_base_ativa()

    base_id = base.id if base else None
    chat_engine = rag_instance.criar_chat_engine(chat_id, base_id, tipo_documento)
    response = chat_engine.stream_chat(pergunta_usuario)

    texto_completo = ""

    try:
        for text in response.response_gen:
            texto_completo += text
            yield text

    finally:
        if texto_completo:
            resposta = salvar_mensagem(
                chat_id=chat_id,
                role="assistant",
                conteudo=texto_completo,
                pergunta_original=pergunta_usuario,
                intencao=tipo_documento,
            )

            salvar_metadados(resposta, response.source_nodes)


@traceable(name="Stream sem documentos", run_type="chain", reduce_fn=_join_stream_chunks)
def stream_sem_documentos(pergunta_usuario, chat_id):
    salvar_mensagem(
        chat_id=chat_id,
        role="assistant",
        conteudo=MENSAGEM_SEM_DOCS,
        pergunta_original=pergunta_usuario,
        intencao="sem_documentos"
    )

    yield MENSAGEM_SEM_DOCS


@traceable(
    name="Stream resposta do chatbot",
    run_type="chain",
    process_inputs=_omit_stream_input,
    reduce_fn=_join_stream_chunks,
)
def trace_stream_resposta(usuario_id, chat_id, pergunta_usuario, stream):
    for chunk in stream:
        yield chunk


class RespostaResolver:
    def __init__(self):
        self.creators = [
            AimlCreator()
        ]

    def criar_resposta(self, pergunta_usuario, chat_id):
        for creator in self.creators:
            resposta = creator.factory_method(
                pergunta_usuario=pergunta_usuario,
                chat_id=chat_id
            )

            if resposta is not None:
                return resposta

        return RagResposta(
            pergunta_usuario=pergunta_usuario,
            chat_id=chat_id
        )


def fazer_pergunta(pergunta_usuario, chat_id=None, usuario_id=None):
    if chat_id is None:
        if usuario_id is None:
            raise ValueError("usuario_id é obrigatório para criar um novo chat")

        titulo = pergunta_usuario[:50] + "..." if len(pergunta_usuario) > 50 else pergunta_usuario

        novo_chat = Chat(
            titulo=titulo,
            usuario_id=usuario_id
        )

        novo_chat.save()

        chat_id = novo_chat.id

    salvar_mensagem(
        chat_id=chat_id,
        role="user",
        conteudo=pergunta_usuario,
        pergunta_original=pergunta_usuario
    )

    sem_documentos = not base_ativa_tem_documentos()

    if sem_documentos:
        return chat_id, stream_sem_documentos(pergunta_usuario, chat_id)

    factory = RespostaResolver()

    resposta = factory.criar_resposta(
        pergunta_usuario=pergunta_usuario,
        chat_id=chat_id
    )

    return chat_id, resposta.stream()


def responder_mensagem(userid, chat_id=None, pergunta=""):
    chat_id, stream = fazer_pergunta(
        pergunta_usuario=pergunta,
        chat_id=chat_id,
        usuario_id=userid
    )

    stream = trace_stream_resposta(userid, chat_id, pergunta, stream)

    return chat_id, stream


@traceable(name="Indexar documento no RAG", run_type="chain")
def indexar_documento_no_rag(caminho: str, tipo: str, data, baseid):
    rag_instance = Rag()
    rag_instance.carregar_llm()
    rag_instance.indexar_documento(caminho, tipo, data, baseid)
