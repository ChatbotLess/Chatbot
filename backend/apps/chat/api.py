from ninja import Router
from django.shortcuts import get_object_or_404
from apps.user.models import User
from apps.chat.models import Chat
from .schemas import ChatSchema

router = Router()

@router.get("/{user_id}", response=list[ChatSchema])
def listar_chats(request, user_id: str):
    usuario = get_object_or_404(User, id=user_id)
    return usuario.chats.all()

@router.post("/chat/", response=ChatSchema)
def chat(request, data: ChatSchema, user_id: str):
    user = get_object_or_404(User, id=user_id)
    chat = Chat(titulo = data.titulo, usuario = user)
    chat.save()

    return chat