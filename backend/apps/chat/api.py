from ninja import Router
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError
from apps.user.models import User
from apps.chat.models import Chat, Mensagem, Feedback
from apps.chat.schemas import MensagemSchemaOut
from .schemas import ChatSchema, FeedbackSchemaIn, FeedbackSchemaOut

router = Router()


def _validar_tipo_feedback(tipo: str) -> str:
    tipo_normalizado = tipo.strip().upper()
    tipos_validos = {Feedback.MensagemFeedback.LIKE, Feedback.MensagemFeedback.DISLIKE}
    if tipo_normalizado not in tipos_validos:
        raise HttpError(400, "Tipo de feedback invalido. Use LIKE ou DISLIKE.")
    return tipo_normalizado

@router.get("/listarchats", response=list[ChatSchema], tags=["Chat"])
def listar_chats(request, user_id: str):
    usuario = get_object_or_404(User, id=user_id)
    return usuario.chats.order_by("-data", "-id")

@router.get("/listarmensagem", response=list[MensagemSchemaOut], tags=["Chat"])
def listar_mensagem(request, userid: str, chatID: str):
    usuario = get_object_or_404(User, id=userid)
    chat = get_object_or_404(Chat, id=chatID, usuario=usuario)
    mensagens = chat.mensagens.order_by("id")
    return mensagens

@router.post("/chat/", response=ChatSchema, tags=["Chat"])
def chat(request, data: ChatSchema, user_id: str):
    user = get_object_or_404(User, id=user_id)
    chat = Chat(titulo = data.titulo, usuario = user)
    chat.save()
    return chat


@router.get("/listarfeedback", response=list[FeedbackSchemaOut], tags=["Chat"])
def listar_feedback(request, userid: str, chatID: str):
    usuario = get_object_or_404(User, id=userid)
    chat = get_object_or_404(Chat, id=chatID, usuario=usuario)
    return Feedback.objects.filter(mensagem__chat=chat).select_related("mensagem")


@router.post("/feedback", response=FeedbackSchemaOut, tags=["Chat"])
def feedback(request, userid: str, chatID: str, mensagemID: str, tipo: str, mensagem_feedback: str = ""):
    usuario = get_object_or_404(User, id=userid)
    chat = get_object_or_404(Chat, id=chatID, usuario=usuario)
    mensagem = get_object_or_404(Mensagem, id=mensagemID, chat=chat)

    feedback_tipo = _validar_tipo_feedback(tipo)

    feedback_obj, _ = Feedback.objects.update_or_create(
        mensagem=mensagem,
        defaults={
            "tipo": feedback_tipo,
            "mensagem_feedback": mensagem_feedback or ""
        }
    )
    return feedback_obj


@router.post("/mensagens/{mensagem_id}/feedback", response=FeedbackSchemaOut, tags=["Chat"])
def registrar_feedback(request, mensagem_id: str, data: FeedbackSchemaIn):
    mensagem = get_object_or_404(Mensagem, id=mensagem_id)

    tipo = _validar_tipo_feedback(data.tipo)

    feedback, _ = Feedback.objects.update_or_create(
        mensagem=mensagem,
        defaults={
            "tipo": tipo,
            "mensagem_feedback": data.mensagem_feedback or ""
        }
    )
    return feedback
