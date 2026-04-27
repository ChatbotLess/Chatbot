from ninja import ModelSchema, Schema
from .models import Chat, Mensagem, Feedback

class ChatSchema(ModelSchema):
    class Meta:
        model = Chat
        fields = "__all__"


class MensagemSchemaOut(ModelSchema):
    class Meta:
        model = Mensagem
        fields = "__all__"


class FeedbackSchemaIn(Schema):
    tipo: str
    mensagem_feedback: str | None = None


class FeedbackSchemaOut(ModelSchema):
    class Meta:
        model = Feedback
        fields = "__all__"
