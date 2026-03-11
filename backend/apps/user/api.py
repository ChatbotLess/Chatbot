from ninja import Router
from .schemas import UserSchema
from .models import User
from django.shortcuts import get_object_or_404

router = Router()

@router.get("/",response=list[UserSchema])
def listar_usuarios(request):
    return User.objects.all()

