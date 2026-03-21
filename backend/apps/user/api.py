from ninja import Router
from .schemas import UserSchemaIn, UserSchemaOut
from .models import User
from django.shortcuts import get_object_or_404

router = Router()

@router.get("/",response=list[UserSchemaOut])
def listar_usuarios(request):
    return User.objects.all()

@router.get("/me/",response=UserSchemaOut)
def me(request, idUsuario: str):
    user = get_object_or_404(User, id=idUsuario)
    return user

@router.post("/User/",response=UserSchemaOut)
def inserir_usuario(request, data: UserSchemaIn):
    user = User(name=data.name, email=data.email)
    user.set_password(data.password)
    user.save()
    return user



