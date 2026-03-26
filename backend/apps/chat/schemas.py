from ninja import ModelSchema
from .models import Chat,Mensagem

class ChatSchema(ModelSchema):
    class Meta:
        model = Chat
        fields = "__all__"

class MensagemSchemaOut(ModelSchema):
    class Meta:
        model = Mensagem
        fields = "__all__"