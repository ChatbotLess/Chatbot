import secrets
from types import SimpleNamespace

from django.contrib.auth import get_user_model
from django.test import TestCase
from ninja.errors import HttpError

from apps.base_conhecimento.api import criar_base_conhecimento, listar_base_conhecimento
from apps.user.api import listar_usuarios
from core.permissions import require_staff


class StaffPermissionTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            firebase_uid="firebase-user",
            email="user@example.com",
            password=secrets.token_urlsafe(24),
            name="Usuario Teste",
        )
        self.admin = user_model.objects.create_user(
            firebase_uid="firebase-admin",
            email="admin@example.com",
            password=secrets.token_urlsafe(24),
            name="Admin Teste",
            is_staff=True,
        )

    def request_for(self, user):
        return SimpleNamespace(auth=user)

    def test_require_staff_rejects_regular_user(self):
        with self.assertRaises(HttpError) as error:
            require_staff(self.request_for(self.user))

        self.assertEqual(error.exception.status_code, 403)

    def test_regular_user_cannot_list_users_or_knowledge_bases(self):
        for endpoint in (listar_usuarios, listar_base_conhecimento):
            with self.subTest(endpoint=endpoint.__name__):
                with self.assertRaises(HttpError) as error:
                    endpoint(self.request_for(self.user))

                self.assertEqual(error.exception.status_code, 403)

    def test_regular_user_cannot_create_knowledge_base(self):
        with self.assertRaises(HttpError) as error:
            criar_base_conhecimento(
                self.request_for(self.user),
                titulo="Base privada",
                versao="1",
                descricao="Nao deve ser criada",
            )

        self.assertEqual(error.exception.status_code, 403)

    def test_staff_can_access_admin_operations(self):
        request = self.request_for(self.admin)

        base = criar_base_conhecimento(
            request,
            titulo="Base administrativa",
            versao="1",
            descricao="Base permitida",
        )

        self.assertEqual(list(listar_base_conhecimento(request)), [base])
        self.assertSetEqual(
            {user.id for user in listar_usuarios(request)},
            {self.user.id, self.admin.id},
        )
