from ninja import ModelSchema
from .models import User

class UserSchema(ModelSchema):
    class Meta:
        model = User
        fields = "__all__"