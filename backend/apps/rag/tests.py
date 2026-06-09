import secrets
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.chat.models import Chat
from apps.rag import services


class FazerPerguntaTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            email="rag-user@example.com",
            password=secrets.token_urlsafe(24),
            name="Usuario Rag",
        )

    def test_fazer_pergunta_requires_usuario_id_when_chat_id_is_none(self):
        with self.assertRaises(ValueError):
            services.fazer_pergunta(pergunta_usuario="Pergunta sem usuario")

    @patch("apps.rag.services.salvar_mensagem")
    @patch("apps.rag.services.ChunkDocumento.objects.exists", return_value=False)
    def test_fazer_pergunta_creates_chat_with_truncated_title_and_sem_docs_stream(
        self, _exists_mock, salvar_mensagem_mock
    ):
        pergunta = "A" * 60

        resposta_stream = services.fazer_pergunta(
            pergunta_usuario=pergunta,
            usuario_id=str(self.user.id),
        )
        resposta = list(resposta_stream)

        chat = Chat.objects.get(usuario=self.user)
        self.assertEqual(chat.titulo, ("A" * 50) + "...")
        self.assertEqual(resposta, [services.MENSAGEM_SEM_DOCS])
        self.assertEqual(salvar_mensagem_mock.call_count, 2)

        ultima_chamada = salvar_mensagem_mock.call_args_list[-1].kwargs
        self.assertEqual(ultima_chamada["chat_id"], chat.id)
        self.assertEqual(ultima_chamada["intencao"], "sem_documentos")

    @patch("apps.rag.services.salvar_mensagem")
    @patch("apps.rag.services.RespostaResolver")
    @patch("apps.rag.services.ChunkDocumento.objects.exists", return_value=True)
    def test_fazer_pergunta_uses_resposta_resolver_when_documents_exist(
        self,
        _exists_mock,
        resposta_resolver_cls_mock,
        salvar_mensagem_mock,
    ):
        chat = Chat.objects.create(titulo="Chat existente", usuario=self.user)

        resposta_obj = MagicMock()
        resposta_obj.stream.return_value = iter(["chunk-1", "chunk-2"])

        resolver_instance = resposta_resolver_cls_mock.return_value
        resolver_instance.criar_resposta.return_value = resposta_obj

        resposta_stream = services.fazer_pergunta(
            pergunta_usuario="Pergunta com base indexada",
            chat_id=chat.id,
        )

        self.assertEqual(list(resposta_stream), ["chunk-1", "chunk-2"])
        resolver_instance.criar_resposta.assert_called_once_with(
            pergunta_usuario="Pergunta com base indexada",
            chat_id=chat.id,
        )
        self.assertEqual(salvar_mensagem_mock.call_count, 1)


class AimlServiceResponderTests(TestCase):
    @patch.object(services.AimlService, "carregar_kernel", return_value=None)
    def test_responder_returns_none_when_kernel_is_unavailable(self, _kernel_mock):
        self.assertIsNone(services.AimlService.responder("teste"))

    def test_responder_returns_none_for_empty_or_rag_token(self):
        kernel = MagicMock()

        kernel.respond.return_value = "   "
        with patch.object(services.AimlService, "carregar_kernel", return_value=kernel):
            self.assertIsNone(services.AimlService.responder("pergunta"))
            kernel.respond.assert_called_with("PERGUNTA")

        kernel.respond.return_value = "__RAG__"
        with patch.object(services.AimlService, "carregar_kernel", return_value=kernel):
            self.assertIsNone(services.AimlService.responder("pergunta"))

    def test_responder_returns_text_for_valid_aiml_answer(self):
        kernel = MagicMock()
        kernel.respond.return_value = "Resposta AIML"

        with patch.object(services.AimlService, "carregar_kernel", return_value=kernel):
            resposta = services.AimlService.responder("pergunta aiml")

        self.assertEqual(resposta, "Resposta AIML")
