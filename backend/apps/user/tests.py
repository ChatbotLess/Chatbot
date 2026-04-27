from django.contrib.auth import get_user_model
from django.test import TestCase


class UserManagerTests(TestCase):
    def setUp(self):
        self.user_model = get_user_model()

    def test_create_user_normalizes_email_and_hashes_password(self):
        user = self.user_model.objects.create_user(
            email="Teste@EXAMPLE.com",
            password="senha-segura-123",
            name="Usuario Teste",
        )

        self.assertEqual(user.email, "Teste@example.com")
        self.assertTrue(user.check_password("senha-segura-123"))
        self.assertNotEqual(user.password, "senha-segura-123")

    def test_create_user_without_email_raises_error(self):
        with self.assertRaises(ValueError):
            self.user_model.objects.create_user(
                email="",
                password="senha-segura-123",
                name="Usuario Teste",
            )

    def test_create_superuser_sets_required_flags(self):
        superuser = self.user_model.objects.create_superuser(
            email="admin@example.com",
            password="admin-123",
            name="Administrador",
        )

        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)

    def test_create_superuser_with_invalid_flags_raises_error(self):
        with self.assertRaises(ValueError):
            self.user_model.objects.create_superuser(
                email="admin@example.com",
                password="admin-123",
                name="Administrador",
                is_staff=False,
            )
