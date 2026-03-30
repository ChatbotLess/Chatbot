from ninja import Router
from django.core.files.storage import FileSystemStorage
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .services import responder_mensagem
from apps.chat.schemas import MensagemSchemaOut
from apps.chat.models import Mensagem

router = Router()

@router.post("/message", response=MensagemSchemaOut)
def enviar_mensagem(request, message: str):
  resposta = responder_mensagem(None,message)
  return resposta

