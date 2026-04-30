#Fonte de pesquisa https://developers.llamaindex.ai/python/framework/integrations/vector_stores/postgres/
from llama_index.core import SimpleDirectoryReader, StorageContext
from llama_index.core import VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from pathlib import Path
from llama_index.vector_stores.postgres import PGVectorStore
from llama_index.llms.openai import OpenAI
from llama_index.core import Settings
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.llms import ChatMessage
import os
from dotenv import load_dotenv
from sqlalchemy import make_url

# SISTEMA DE BUSCA HÍBRIDA
# Combina 2 tipos de busca e junta os resultados para uma melhor precisão
from llama_index.core.response_synthesizers import CompactAndRefine
from llama_index.core.retrievers import QueryFusionRetriever
from llama_index.core.query_engine import RetrieverQueryEngine

# Importar os models do Django
from apps.chat.models import Mensagem, Chat

class Rag():
  def __init__(self, temperature=0.5):
    self.temperature = temperature
    # USA O BANCO DE DADOS DO DJANGO
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "postgres")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    self.connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}"
    self.db_name = os.getenv("DB_NAME", "chatbot_db")  # Banco do Django

  def carregar_llm(self):
    #LENDO API KEY
    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')

    # CONFIGURANDO O LLM DA OPENAI
    llm = OpenAI(
        model="gpt-4.1-mini",  
        temperature=self.temperature,       # Criatividade (0.0 = mais focado, 1.0 = mais criativo)
        api_key=api_key,
    )

    # Define o LLM globalmente no LlamaIndex
    Settings.llm = llm
  
  def leitura_documento(self,caminho, tipo, data):
    def metadata_arquivo(file_path):        
        return {
            "caminho": str(file_path),
            "tipo": tipo,
            "data": str(data),
        }
    
    documents = SimpleDirectoryReader(
      input_files=[caminho],
      file_metadata=metadata_arquivo
    )
    
    #LENDO DOCUMENTO
    docs = documents.load_data()

    #Separando em nodes (chunks)
    node_parser = SentenceSplitter(chunk_size=1000, chunk_overlap=200)

    self.nodes = node_parser.get_nodes_from_documents(docs, show_progress=True)

  def _criar_vector_store(self):
      # FAZ O SCHEMA DOS EMBBEDINGS NO BANCO 
      url = make_url(self.connection_string)
      
      hybrid_vector_store = PGVectorStore.from_params(
          database=self.db_name,
          host=url.host,
          password=url.password,
          port=url.port,
          user=url.username,
          table_name="rag_chunkdocumento",  # Tabela do Django
          embed_dim=1536,  # openai embedding dimension
          hybrid_search=True,
          text_search_config="portuguese",
          #constroi um "mapa"
          hnsw_kwargs={
              "hnsw_m": 16, #conexoes
              "hnsw_ef_construction": 64, #qualidade
              "hnsw_ef_search": 40, #rapidez 
              "hnsw_dist_method": "vector_cosine_ops", #Similaridade de cosseno
          },
      )

      return hybrid_vector_store

  def criar_indice(self, nodes=None):
    hybrid_vector_store = self._criar_vector_store()

    storage_context = StorageContext.from_defaults(
      vector_store=hybrid_vector_store
    )

    self.hybrid_index = VectorStoreIndex(
      nodes or [],
      storage_context=storage_context
    )

  def indexar_documento(self, caminho,tipo, data ):
    #Lê um único arquivo, gera os chunks e insere no vector store.
    self.leitura_documento(caminho,tipo, data)

    hybrid_vector_store = self._criar_vector_store()
    storage_context = StorageContext.from_defaults(vector_store=hybrid_vector_store)

    # Insere apenas os nodes do arquivo enviado no vector store existente
    VectorStoreIndex(
      self.nodes,
      storage_context=storage_context,
    )
        
  def conectar_indice_existente(self):
    hybrid_vector_store = self._criar_vector_store()

    storage_context = StorageContext.from_defaults(
       vector_store=hybrid_vector_store
    )

    self.hybrid_index = VectorStoreIndex.from_vector_store(
      vector_store=hybrid_vector_store,
      storage_context=storage_context
    )

  def busca_hibrida(self):
    vector_retriever = self.hybrid_index.as_retriever(
      vector_store_query_mode="default",
      similarity_top_k=5,
    )
    
    text_retriever = self.hybrid_index.as_retriever(
        vector_store_query_mode="sparse",
        similarity_top_k=5,  
    )
    
    retriever = QueryFusionRetriever(
      [vector_retriever, text_retriever],
      similarity_top_k=5,
      num_queries=1,  
      mode="relative_score",
      use_async=False,
    )

    response_synthesizer = CompactAndRefine(streaming=True)
    
    return retriever, response_synthesizer
    
  def criar_chat_engine(self, chat_id):
    #Cria um chat engine com memória baseada no model Mensagem do Django
    from llama_index.core.chat_engine import CondensePlusContextChatEngine
    
    # Carregar histórico de mensagens do banco de dados
    mensagens = Mensagem.objects.filter(chat_id=chat_id).order_by('id')
    
    # Converter mensagens do Django para formato ChatMessage do LlamaIndex
    chat_history = []
    for msg in mensagens:
      chat_message = ChatMessage(
        role=msg.role,
        content=msg.conteudo
      )
      chat_history.append(chat_message)
    
    # Criar memória com histórico
    memory = ChatMemoryBuffer.from_defaults(
      token_limit=1000,
      chat_history=chat_history
    )
    
    # Usar a função busca_hibrida para obter retriever e response_synthesizer
    retriever, response_synthesizer = self.busca_hibrida()
    
    # Chat Engine com contexto e memória
    chat_engine = CondensePlusContextChatEngine.from_defaults(
      retriever=retriever,
      response_synthesizer=response_synthesizer,
      memory=memory,
      system_prompt = (
          "Você é um assistente RAG especializado em responder perguntas a partir de documentos fornecidos como contexto. "
          "Responda sempre em português, com clareza, precisão e fidelidade ao material recuperado. "
          "Baseie sua resposta exclusivamente no contexto disponível. "
          "Não invente informações, não complete lacunas com conhecimento externo e não apresente hipóteses como fatos. "
          "Antes de responder, identifique quais partes do contexto são relevantes para a pergunta. "
          "Se a resposta puder ser inferida diretamente do contexto, forneça a resposta e explique brevemente a evidência usada. "
          "Se a pergunta exigir cruzamento de informações entre diferentes trechos, faça essa conexão explicitamente. "
          "Se o contexto não contiver informação, responda somente: 'Não há informação suficiente no contexto fornecido para responder com segurança.' "
          "Se houver contradições, ambiguidades ou ausência de detalhes importantes no contexto, informe isso de maneira transparente. "
          "Mantenha um tom profissional, objetivo e útil."
      )
    )
    
    return chat_engine
  
  
  
