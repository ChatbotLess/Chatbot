from ninja import Router
from .services import responder_mensagem
from apps.chat.schemas import MensagemSchemaOut
from typing import Optional
from django.http import StreamingHttpResponse


router = Router()

@router.post("/message", tags=["Rag"])
def enviar_mensagem(request, userid: str, message: str, chatID: Optional[str] = None):
  resposta = responder_mensagem(userid,chatID,message)
  
  return StreamingHttpResponse(resposta, content_type='text/plain')



