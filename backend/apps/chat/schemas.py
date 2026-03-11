from ninja import ModelSchema
from .models import Chat

class ChatSchema(ModelSchema):
    class Meta:
        model = Chat
        fields = "__all__"