#Fonte de pesquisa https://developers.llamaindex.ai/python/framework/integrations/vector_stores/postgres/
from llama_index.core import SimpleDirectoryReader, StorageContext
from llama_index.core import VectorStoreIndex
from llama_index.core.node_parser import SentenceSplitter
from llama_index.vector_stores.postgres import PGVectorStore
from llama_index.llms.openai import OpenAI
from llama_index.core import Settings
from llama_index.storage.chat_store.postgres import PostgresChatStore
import os
from dotenv import load_dotenv
import psycopg2
from sqlalchemy import make_url
import gradio as gr

#LENDO API KEY
load_dotenv()

api_key = os.getenv('OPENAI_API_KEY')

# CONFIGURANDO O LLM DA OPENAI
llm = OpenAI(
    model="gpt-5-nano",  # ou "gpt-4", "gpt-3.5-turbo"
    temperature=0.7,       # Criatividade (0.0 = mais focado, 1.0 = mais criativo)
    api_key=api_key
)

# Define o LLM globalmente no LlamaIndex
Settings.llm = llm

documents = SimpleDirectoryReader(input_dir="data/portarias")

#LENDO DOCUMENTOS
docs = documents.load_data()

#Separando em nodes (chunks)
node_parser = SentenceSplitter(chunk_size=1000, chunk_overlap=200)

nodes = node_parser.get_nodes_from_documents(docs, show_progress=True)


#CRIACAO DO DATABASE
connection_string = "postgresql://postgres:postgres@localhost:5432"
db_name = "vector_db"
conn = psycopg2.connect(connection_string)
conn.autocommit = True


with conn.cursor() as c:
    c.execute(f"DROP DATABASE IF EXISTS {db_name}")
    c.execute(f"CREATE DATABASE {db_name}")


# FAZ O embedding E GUARDA NO BANCO DE DADOS
url = make_url(connection_string)
hybrid_vector_store = PGVectorStore.from_params(
    database=db_name,
    host=url.host,
    password=url.password,
    port=url.port,
    user=url.username,
    table_name="documento_hybrid_search",
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

storage_context = StorageContext.from_defaults(
    vector_store=hybrid_vector_store
)
hybrid_index = VectorStoreIndex.from_documents(
    nodes, storage_context=storage_context
)

# SISTEMA DE BUSCA HÍBRIDA
# Combina 2 tipos de busca e junta os resultados para uma melhor precisão
from llama_index.core.response_synthesizers import CompactAndRefine
from llama_index.core.retrievers import QueryFusionRetriever
from llama_index.core.query_engine import RetrieverQueryEngine

vector_retriever = hybrid_index.as_retriever(
    vector_store_query_mode="default",
    similarity_top_k=5,
)
text_retriever = hybrid_index.as_retriever(
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

response_synthesizer = CompactAndRefine()

# CRIANDO CHAT ENGINE COM MEMÓRIA DE CONVERSA
from llama_index.core.chat_engine import CondensePlusContextChatEngine
from llama_index.core.memory import ChatMemoryBuffer

# Conexao com banco para guardar o historico da conversa
chat_store = PostgresChatStore.from_uri(
    uri="postgresql+asyncpg://postgres:postgres@localhost:5432/chatdatabase",
)

# Memória do chat (guarda as últimas conversas)
memory = ChatMemoryBuffer.from_defaults(
    token_limit=1000,
    chat_store=chat_store
)

# Chat Engine com contexto e memória
chat_engine = CondensePlusContextChatEngine.from_defaults(
    retriever=retriever,
    response_synthesizer=response_synthesizer,
    memory=memory,
    system_prompt=(
        "Você é um assistente virtual prestativo e inteligente. "
        "Use o contexto fornecido para responder perguntas de forma clara e precisa. "
        "Se não souber a resposta, diga que não tem essa informação. "
        "Sempre responda em português."
    ),
)


def chatbot_response(message, chat_history):
    resposta = chat_engine.chat(message)

    if chat_history is None:
        chat_history = []
    
    chat_history.append({"role": "user", "content": message})
    chat_history.append({"role": "assistant", "content": resposta.response})
    
    return "", chat_history
  
def reset_chat():
    chat_engine.reset()
    return []

with gr.Blocks() as demo:
    gr.Markdown("# Chatbot de LLM")
    chatbot_ui = gr.Chatbot()
    msg = gr.Textbox(label="Digite sua mensagem", placeholder="Faça sua pergunta aqui...")
    resetar = gr.Button("Limpar Conversa")
    
    msg.submit(chatbot_response, [msg, chatbot_ui], [msg, chatbot_ui])
    resetar.click(reset_chat, None, chatbot_ui, queue=False)

demo.launch(debug=True)
