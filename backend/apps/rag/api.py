from ninja import Router
from .services import responder_mensagem
from apps.chat.schemas import MensagemSchemaOut
from typing import Optional


router = Router()

@router.post("/message", response=MensagemSchemaOut, tags=["Rag"])
def enviar_mensagem(request, userid: str, message: str, chatID: Optional[str] = None):
  resposta = responder_mensagem(userid,chatID,message)
  return resposta


