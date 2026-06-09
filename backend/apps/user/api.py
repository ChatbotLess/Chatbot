from ninja import Router
from core.permissions import require_staff
from .schemas import UserSchemaOut
from .models import User

router = Router()

@router.get("/",response=list[UserSchemaOut], tags=["Usuario"])
def listar_usuarios(request):
    require_staff(request)
    return User.objects.all()

@router.get("/me/",response=UserSchemaOut, tags=["Usuario"])
def me(request):
    return request.auth
