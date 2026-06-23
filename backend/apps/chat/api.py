from ninja import Router
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from ninja.errors import HttpError
from apps.chat.models import Chat, Mensagem, Feedback
from apps.rag.models import MensagemChunk
from apps.chat.schemas import MensagemSchemaOut
from .schemas import ChatSchema, FeedbackSchemaIn, FeedbackSchemaOut

router = Router()


@router.get("/listarchats", response=list[ChatSchema], tags=["Chat"])
def listar_chats(request):
    return request.auth.chats.order_by("-data", "-id")

@router.get("/listarmensagem", response=list[MensagemSchemaOut], tags=["Chat"])
def listar_mensagem(request, chatID: str):
    chat = get_object_or_404(Chat, id=chatID, usuario=request.auth)
    mensagens = chat.mensagens.prefetch_related(
        Prefetch(
            "mensagem_chunks",
            queryset=MensagemChunk.objects.select_related("chunk").order_by("id"),
        )
    ).order_by("id")
    return mensagens

@router.post("/chat/", response=ChatSchema, tags=["Chat"])
def chat(request, data: ChatSchema):
    chat = Chat(titulo = data.titulo, usuario = request.auth)
    chat.save()
    return chat


@router.get("/listarfeedback", response=list[FeedbackSchemaOut], tags=["Feedback"])
def listar_feedback(request, chatID: str):
    chat = get_object_or_404(Chat, id=chatID, usuario=request.auth)
    return Feedback.objects.filter(mensagem__chat=chat).select_related("mensagem")


@router.post("/feedback", response=FeedbackSchemaOut, tags=["Feedback"])
def feedback(request, chatID: str, mensagemID: str, tipo: str, mensagem_feedback: str = ""):
    chat = get_object_or_404(Chat, id=chatID, usuario=request.auth)
    mensagem = get_object_or_404(Mensagem, id=mensagemID, chat=chat)

    feedback_tipo = tipo.strip().upper()
    mensagem_feedback = mensagem_feedback or ""

    if feedback_tipo == Feedback.MensagemFeedback.DISLIKE and not mensagem_feedback.strip():
        raise HttpError(400, "Mensagem do feedback e obrigatoria para feedback negativo.")

    feedback_obj = Feedback.objects.filter(mensagem=mensagem).first() or Feedback(mensagem=mensagem)
    feedback_obj.tipo = feedback_tipo
    feedback_obj.mensagem_feedback = mensagem_feedback

    try:
        feedback_obj.full_clean(exclude=["mensagem_feedback"])
        feedback_obj.save()
    except ValidationError as e:
        if "tipo" in getattr(e, "message_dict", {}):
            raise HttpError(400, "Tipo de feedback invalido. Use LIKE ou DISLIKE.")
        raise HttpError(400, e.messages)

    return feedback_obj


@router.post("/mensagens/{mensagem_id}/feedback", response=FeedbackSchemaOut, tags=["Feedback"])
def registrar_feedback(request, mensagem_id: str, data: FeedbackSchemaIn):
    mensagem = get_object_or_404(
        Mensagem.objects.select_related("chat"),
        id=mensagem_id,
        chat__usuario=request.auth,
    )

    tipo = data.tipo.strip().upper()
    mensagem_feedback = data.mensagem_feedback or ""

    if tipo == Feedback.MensagemFeedback.DISLIKE and not mensagem_feedback.strip():
        raise HttpError(400, "Mensagem do feedback e obrigatoria para feedback negativo.")

    feedback = Feedback.objects.filter(mensagem=mensagem).first() or Feedback(mensagem=mensagem)
    feedback.tipo = tipo
    feedback.mensagem_feedback = mensagem_feedback

    try:
        feedback.full_clean(exclude=["mensagem_feedback"])
        feedback.save()
    except ValidationError as e:
        if "tipo" in getattr(e, "message_dict", {}):
            raise HttpError(400, "Tipo de feedback invalido. Use LIKE ou DISLIKE.")
        raise HttpError(400, e.messages)

    return feedback
