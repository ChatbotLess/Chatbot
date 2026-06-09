from ninja import ModelSchema
from .models import User

class UserSchemaOut(ModelSchema):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'is_staff']


class UserSchemaIn(ModelSchema):
    class Meta:
        model = User
        exclude = ['id','last_login', 'user_permissions', 'is_superuser', 'groups','is_staff','created_at','updated_at']
