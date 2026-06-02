import logging

from django.core.exceptions import ImproperlyConfigured
from django.db import transaction
from ninja.security import HttpBearer

from apps.user.models import User
from core.firebase import verify_id_token

logger = logging.getLogger(__name__)


def _token_name(decoded_token: dict, email: str) -> str:
    name = (
        decoded_token.get("name")
        or decoded_token.get("displayName")
        or email.split("@")[0]
        or "Firebase User"
    )
    return str(name).strip()[:150] or "Firebase User"


def _token_email(decoded_token: dict, firebase_uid: str) -> str:
    email = (decoded_token.get("email") or "").strip().lower()
    return email or f"{firebase_uid}@firebase.local"


class FirebaseAuthentication(HttpBearer):
    def authenticate(self, request, token: str):
        try:
            decoded_token = verify_id_token(token)
        except ImproperlyConfigured:
            raise
        except Exception:
            logger.info("Firebase ID token invalido.", exc_info=True)
            return None

        firebase_uid = decoded_token.get("uid")
        if not firebase_uid:
            return None

        email = _token_email(decoded_token, firebase_uid)
        name = _token_name(decoded_token, email)

        with transaction.atomic():
            user = (
                User.objects.select_for_update()
                .filter(firebase_uid=firebase_uid)
                .first()
            )

            if user is None:
                user = User.objects.select_for_update().filter(email=email).first()

            if user is None:
                user = User(firebase_uid=firebase_uid, email=email, name=name)
                user.set_unusable_password()
                user.save()
                return user

            changed_fields = []
            if user.firebase_uid != firebase_uid:
                user.firebase_uid = firebase_uid
                changed_fields.append("firebase_uid")
            if user.email != email:
                user.email = email
                changed_fields.append("email")
            if name and user.name != name:
                user.name = name
                changed_fields.append("name")

            if changed_fields:
                user.save(update_fields=changed_fields)

            return user
