from .settings import *  # noqa: F401,F403


DEBUG = False

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "test_db.sqlite3",
    }
}

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

MIGRATION_MODULES = {
    "user": None,
    "chat": None,
    "rag": None,
    "base_conhecimento": None,
    "analytics": None,
}
