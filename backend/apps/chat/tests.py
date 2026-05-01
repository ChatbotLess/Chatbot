from django.contrib.auth import get_user_model
from django.test import TestCase
from ninja.errors import HttpError

from apps.chat.api import feedback
from apps.chat.models import Chat, Feedback, Mensagem


class FeedbackApiTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            email="user@example.com",
            password="senha-segura-123",
            name="Usuario Teste",
        )
        self.chat = Chat.objects.create(titulo="Chat de teste", usuario=self.user)
        self.mensagem = Mensagem.objects.create(
            conteudo="Pergunta",
            role="user",
            chat=self.chat,
        )

    def test_feedback_creates_and_updates_without_duplicates(self):
        created = feedback(
            request=None,
            userid=str(self.user.id),
            chatID=str(self.chat.id),
            mensagemID=str(self.mensagem.id),
            tipo="like",
            mensagem_feedback="Bom resultado",
        )

        self.assertEqual(Feedback.objects.count(), 1)
        self.assertEqual(created.tipo, Feedback.MensagemFeedback.LIKE)
        self.assertEqual(created.mensagem_feedback, "Bom resultado")

        updated = feedback(
            request=None,
            userid=str(self.user.id),
            chatID=str(self.chat.id),
            mensagemID=str(self.mensagem.id),
            tipo="DISLIKE",
            mensagem_feedback="Nao ajudou",
        )

        self.assertEqual(Feedback.objects.count(), 1)
        self.assertEqual(updated.id, created.id)
        self.assertEqual(updated.tipo, Feedback.MensagemFeedback.DISLIKE)
        self.assertEqual(updated.mensagem_feedback, "Nao ajudou")

    def test_feedback_rejects_invalid_tipo(self):
        with self.assertRaises(HttpError):
            feedback(
                request=None,
                userid=str(self.user.id),
                chatID=str(self.chat.id),
                mensagemID=str(self.mensagem.id),
                tipo="spam",
            )

    def test_feedback_negativo_exige_mensagem(self):
        with self.assertRaises(HttpError):
            feedback(
                request=None,
                userid=str(self.user.id),
                chatID=str(self.chat.id),
                mensagemID=str(self.mensagem.id),
                tipo="DISLIKE",
                mensagem_feedback="",
            )
