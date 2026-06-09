from ninja.errors import HttpError


def require_staff(request):
    user = getattr(request, "auth", None)
    if not user or not user.is_staff:
        raise HttpError(403, "Acesso restrito a administradores.")

    return user
