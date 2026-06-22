from pathlib import Path

import firebase_admin
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from firebase_admin import credentials


def get_firebase_app():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    credentials_path = getattr(settings, "FIREBASE_CREDENTIALS_PATH", None)
    if not credentials_path:
        raise ImproperlyConfigured("FIREBASE_CREDENTIALS_PATH nao configurado.")

    credentials_file = Path(credentials_path)
    if not credentials_file.exists():
        raise ImproperlyConfigured(
            f"Arquivo de credenciais Firebase nao encontrado: {credentials_file}"
        )

    cred = credentials.Certificate(str(credentials_file))
    return firebase_admin.initialize_app(cred)


def verify_id_token(token: str):
    get_firebase_app()

    from firebase_admin import auth as firebase_auth

    return firebase_auth.verify_id_token(token)
