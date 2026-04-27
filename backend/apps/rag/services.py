from apps.chat.models import Mensagem, Chat
from .models import ChunkDocumento, MensagemChunk
from apps.rag.rag import Rag

from pathlib import Path
import time

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

MENSAGEM_SEM_DOCS = (
    "Ainda não há documentos indexados na base de conhecimento. "
    "Por favor, envie um documento antes de fazer perguntas."
)

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
    def responder(cls, pergunta_usuario):
        kernel = cls.carregar_kernel()
        if kernel is None:
            return None
        pergunta_normalizada = pergunta_usuario.upper()
        resposta = kernel.respond(pergunta_normalizada).strip()

        if not resposta:
            return None

        if resposta == "__RAG__":
            return None

        return resposta


class AimlResposta:
    def __init__(self, pergunta_usuario, chat_id, resposta):
        self.pergunta_usuario = pergunta_usuario
        self.chat_id = chat_id
        self.resposta = resposta

    def stream(self):
        salvar_mensagem(
            chat_id=self.chat_id,
            role="assistant",
            conteudo=self.resposta,
            pergunta_original=self.pergunta_usuario,
            intencao="aiml"
        )

        yield self.resposta


class RagResposta:
    def __init__(self, pergunta_usuario, chat_id):
        self.pergunta_usuario = pergunta_usuario
        self.chat_id = chat_id

    def stream(self):
        rag_instance = inicializar_rag()
        chat_engine = rag_instance.criar_chat_engine(self.chat_id)

        response = chat_engine.stream_chat(self.pergunta_usuario)

        texto_completo = ""

        try:
            for text in response.response_gen:
                texto_completo += text
                yield text

        finally:
            if texto_completo:
                resposta = salvar_mensagem(
                    chat_id=self.chat_id,
                    role="assistant",
                    conteudo=texto_completo,
                    pergunta_original=self.pergunta_usuario,
                    intencao="rag"
                )

                salvar_metadados(resposta, response.source_nodes)


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


class RespostaResolver:
    def __init__(self):
        self.creators = [
            AimlCreator(),
            RagCreator()
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

    sem_documentos = not ChunkDocumento.objects.exists()

    if sem_documentos:
        def stream_sem_documentos():
            salvar_mensagem(
                chat_id=chat_id,
                role="assistant",
                conteudo=MENSAGEM_SEM_DOCS,
                pergunta_original=pergunta_usuario,
                intencao="sem_documentos"
            )

            yield MENSAGEM_SEM_DOCS

        return stream_sem_documentos()

    factory = RespostaResolver()

    resposta = factory.criar_resposta(
        pergunta_usuario=pergunta_usuario,
        chat_id=chat_id
    )

    return resposta.stream()


def responder_mensagem(userid, chat_id=None, pergunta=""):
    resposta = fazer_pergunta(
        pergunta_usuario=pergunta,
        chat_id=chat_id,
        usuario_id=userid
    )

    return resposta


def indexar_documento_no_rag(caminho: str, tipo: str, data):
    rag_instance = Rag()
    rag_instance.carregar_llm()
    rag_instance.indexar_documento(caminho, tipo, data)
