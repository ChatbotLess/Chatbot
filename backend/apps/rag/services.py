from apps.chat.models import Mensagem, Chat
from .models import ChunkDocumento, MensagemChunk
from apps.rag.rag import Rag
from pathlib import Path
import os

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
  for node in procura_nodes: #Percorre a resposta procurando os nodes
      node_id = node.node.node_id
      nome_arquivo = node.node.metadata.get("file_name", "")
      chunk = ChunkDocumento.objects.filter(node_id=node_id).first() #Ve 
      if chunk:
        MensagemChunk.objects.get_or_create(
          chunk=chunk,
          mensagem=mensagem,
          defaults={"nome_arquivo": nome_arquivo}
        )
    

def fazer_pergunta(pergunta_usuario, chat_id=None, usuario_id=None):
    # Se não tiver chat_id, criar um novo chat
    if chat_id is None:
      if usuario_id is None:
        raise ValueError("usuario_id é obrigatório para criar um novo chat")
      
      # Criar um novo chat com título baseado na pergunta (primeiras 50 caracteres)
      titulo = pergunta_usuario[:50] + "..." if len(pergunta_usuario) > 50 else pergunta_usuario
      
      novo_chat = Chat(
        titulo=titulo,
        usuario_id=usuario_id
      )
      
      novo_chat.save()
      
      chat_id = novo_chat.id
    
    # Salvar pergunta do usuário
    salvar_mensagem(
      chat_id=chat_id,
      role="user",
      conteudo=pergunta_usuario,
      pergunta_original=pergunta_usuario
    )
    
    sem_documentos = not ChunkDocumento.objects.exists()

    if sem_documentos:
      MENSAGEM_SEM_DOCS = (
        "Ainda não há documentos indexados na base de conhecimento. "
        "Por favor, envie um documento antes de fazer perguntas."
      )

      def stream_sem_documentos():
        salvar_mensagem(
          chat_id=chat_id,
          role="assistant",
          conteudo=MENSAGEM_SEM_DOCS,
          pergunta_original=pergunta_usuario,
        )
        yield MENSAGEM_SEM_DOCS

      return stream_sem_documentos()

    rag_instance = inicializar_rag()
    chat_engine = rag_instance.criar_chat_engine(chat_id)

    # Obter resposta
    response = chat_engine.stream_chat(pergunta_usuario)

    #Faz o stream da resposta
    def stream_resposta():
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
                )
                salvar_metadados(resposta, response.source_nodes)

    return stream_resposta()
    

def responder_mensagem(userid, chat_id=None, pergunta=""):
  resposta = fazer_pergunta(pergunta, chat_id, userid) 
  return resposta;

def inicializar_rag():
  
  rag_instance = Rag()
  rag_instance.carregar_llm()
  rag_instance.conectar_indice_existente()
  
  return rag_instance


def indexar_documento_no_rag(caminho: str,tipo: str,data):
  #Gera embeddings de um único arquivo e insere no vector store.
  rag_instance = Rag()
  rag_instance.carregar_llm()
  rag_instance.indexar_documento(caminho,tipo,data)
