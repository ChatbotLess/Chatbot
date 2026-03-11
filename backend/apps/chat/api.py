from ninja import Router
from django.shortcuts import get_object_or_404
from apps.user.models import User
from .schemas import ChatSchema

router = Router()

@router.get("/{user_id}", response=list[ChatSchema])
def listar_chats(request, user_id: int):
    usuario = get_object_or_404(User, id=user_id)
    return usuario.chats.all()