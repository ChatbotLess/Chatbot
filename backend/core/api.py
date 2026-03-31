from ninja import NinjaAPI
from apps.user.api import router as users_router
from apps.chat.api import router as chat_router
from apps.base_conhecimento.api import router as base_router
from apps.rag.api import router as rag_router

api = NinjaAPI()

# Adiciona o router de usuários
api.add_router("/users/", users_router)
api.add_router("/chat/", chat_router)
api.add_router("/base_conhecimento/", base_router)
api.add_router("/rag/", rag_router)