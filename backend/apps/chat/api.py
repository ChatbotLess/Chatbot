from ninja import Router
from django.shortcuts import get_object_or_404
from apps.user.models import User
from apps.chat.models import Chat
from apps.chat.schemas import MensagemSchemaOut
from .schemas import ChatSchema

router = Router()

@router.get("/listarchats", response=list[ChatSchema], tags=["Chat"])
def listar_chats(request, user_id: str):
    usuario = get_object_or_404(User, id=user_id)
    return usuario.chats.all()

@router.get("/listarmensagem", response=list[MensagemSchemaOut], tags=["Chat"])
def listar_mensagem(request, userid: str, chatID: str):
    usuario = get_object_or_404(User, id=userid)
    chat = get_object_or_404(Chat, id=chatID, usuario=usuario)
    mensagens = chat.mensagens.all() 
    return mensagens

@router.post("/chat/", response=ChatSchema, tags=["Chat"])
def chat(request, data: ChatSchema, user_id: str):
    user = get_object_or_404(User, id=user_id)
    chat = Chat(titulo = data.titulo, usuario = user)
    chat.save()
    return chat