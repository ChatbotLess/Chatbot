import secrets
import tempfile
from pathlib import Path
from types import SimpleNamespace

from django.contrib.auth import get_user_model
from django.test import TestCase
from ninja.errors import HttpError

from apps.chat.api import feedback
from apps.chat.models import Chat, Feedback, Mensagem
from apps.chat.schemas import MensagemSchemaOut


class _RelatedList(list):
    def all(self):
        return self


class FeedbackApiTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            email="user@example.com",
            password=secrets.token_urlsafe(24),
            name="Usuario Teste",
        )
        self.chat = Chat.objects.create(titulo="Chat de teste", usuario=self.user)
        self.mensagem = Mensagem.objects.create(
            conteudo="Pergunta",
            role="user",
            chat=self.chat,
        )
        self.request = SimpleNamespace(auth=self.user)

    def test_feedback_creates_and_updates_without_duplicates(self):
        created = feedback(
            request=self.request,
            chatID=str(self.chat.id),
            mensagemID=str(self.mensagem.id),
            tipo="like",
            mensagem_feedback="Bom resultado",
        )

        self.assertEqual(Feedback.objects.count(), 1)
        self.assertEqual(created.tipo, Feedback.MensagemFeedback.LIKE)
        self.assertEqual(created.mensagem_feedback, "Bom resultado")

        updated = feedback(
            request=self.request,
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
                request=self.request,
                chatID=str(self.chat.id),
                mensagemID=str(self.mensagem.id),
                tipo="spam",
            )

    def test_feedback_negativo_exige_mensagem(self):
        with self.assertRaises(HttpError):
            feedback(
                request=self.request,
                chatID=str(self.chat.id),
                mensagemID=str(self.mensagem.id),
                tipo="DISLIKE",
                mensagem_feedback="",
            )


class MensagemSchemaOutTests(TestCase):
    def test_resolve_fontes_uses_chunk_relation_metadata(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            caminho = Path(temp_dir) / "documentos" / "resolucao.pdf"
            mensagem = SimpleNamespace(
                mensagem_chunks=_RelatedList(
                    [
                        SimpleNamespace(
                            nome_arquivo="",
                            chunk=SimpleNamespace(
                                id=10,
                                node_id="node-10",
                                text=" ".join(["texto"] * 90),
                                metadata={
                                    "caminho": str(caminho),
                                    "tipo": "RESOLUCAO",
                                    "data": "2026-06-01",
                                },
                            ),
                        )
                    ]
                )
            )

            fontes = MensagemSchemaOut.resolve_fontes(mensagem)

        self.assertEqual(len(fontes), 1)
        self.assertEqual(fontes[0].chunk_id, 10)
        self.assertEqual(fontes[0].node_id, "node-10")
        self.assertEqual(fontes[0].nome_arquivo, "resolucao.pdf")
        self.assertEqual(fontes[0].tipo, "RESOLUCAO")
        self.assertEqual(fontes[0].data, "2026-06-01")
        self.assertLessEqual(len(fontes[0].trecho), 303)
