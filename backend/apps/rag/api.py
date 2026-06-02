from ninja import Router
from .services import responder_mensagem
from typing import Optional
from django.http import StreamingHttpResponse


router = Router()

@router.post("/message", tags=["Rag"])
def enviar_mensagem(request, message: str, chatID: Optional[str] = None):
    chat_id, stream = responder_mensagem(str(request.auth.id), chatID, message)

    response = StreamingHttpResponse(stream, content_type='text/plain')
    response["X-Chat-Id"] = str(chat_id)
    response["Access-Control-Expose-Headers"] = "X-Chat-Id"

    return response



