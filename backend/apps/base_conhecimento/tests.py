import secrets
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.base_conhecimento.api import (
    atualizar_base,
    atualizar_documento,
    excluir_base,
    excluir_documento,
    reindexar_base,
    reindexar_documento,
)
from apps.base_conhecimento.models import Base_Conhecimento, Documento
from apps.base_conhecimento.schemas import BaseConhecimentoUpdateIn, DocumentoUpdateIn


class BaseConhecimentoManagementTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.admin = user_model.objects.create_user(
            firebase_uid="firebase-admin-base",
            email="admin-base@example.com",
            password=secrets.token_urlsafe(24),
            name="Admin Base",
            is_staff=True,
        )
        self.request = SimpleNamespace(auth=self.admin)
        self.base = Base_Conhecimento.objects.create(
            titulo="Base antiga",
            versao="1",
            descricao="Descricao antiga",
            status=Base_Conhecimento.StatusBaseDocumento.Ativo,
        )

    def criar_documento(self, nome="documento.pdf"):
        return Documento.objects.create(
            nome_documento=nome,
            tipo="PORTARIA",
            caminho=nome,
            status=Documento.StatusDocumento.CONCLUIDO,
            usuario=self.admin,
            base=self.base,
        )

    def test_atualizar_base_changes_metadata(self):
        payload = BaseConhecimentoUpdateIn(
            titulo="Base atualizada",
            versao="2",
            descricao="Descricao atualizada",
        )

        base = atualizar_base(self.request, self.base.id, payload)

        self.assertEqual(base.titulo, "Base atualizada")
        self.assertEqual(base.versao, "2")
        self.assertEqual(base.descricao, "Descricao atualizada")

    @patch("apps.base_conhecimento.api._enfileirar_reindexacao_documento")
    @patch("apps.base_conhecimento.api.remover_chunks_documento")
    def test_atualizar_documento_reindexes_with_new_metadata(
        self, remover_chunks_mock, enfileirar_mock
    ):
        documento = self.criar_documento()
        payload = DocumentoUpdateIn(
            nome_documento="documento-renomeado.pdf",
            tipo="resolucao",
        )

        atualizado = atualizar_documento(self.request, documento.id, payload)

        self.assertEqual(atualizado.nome_documento, "documento-renomeado.pdf")
        self.assertEqual(atualizado.tipo, "RESOLUCAO")
        self.assertEqual(atualizado.status, Documento.StatusDocumento.PROCESSANDO)
        remover_chunks_mock.assert_called_once()
        enfileirar_mock.assert_called_once_with(atualizado)

    @patch("apps.base_conhecimento.api._enfileirar_reindexacao_documento")
    @patch("apps.base_conhecimento.api.remover_chunks_documento")
    def test_reindexar_documento_sets_processing_and_enqueues_task(
        self, remover_chunks_mock, enfileirar_mock
    ):
        documento = self.criar_documento()

        atualizado = reindexar_documento(self.request, documento.id)

        self.assertEqual(atualizado.status, Documento.StatusDocumento.PROCESSANDO)
        remover_chunks_mock.assert_called_once()
        enfileirar_mock.assert_called_once_with(atualizado)

    @patch("apps.base_conhecimento.api.remover_chunks_documento")
    def test_excluir_documento_removes_record_and_chunks(self, remover_chunks_mock):
        documento = self.criar_documento()

        response = excluir_documento(self.request, documento.id)

        self.assertEqual(response["total"], 1)
        self.assertFalse(Documento.objects.filter(id=documento.id).exists())
        remover_chunks_mock.assert_called_once()

    @patch("apps.base_conhecimento.api._enfileirar_reindexacao_base")
    def test_reindexar_base_reindexes_all_documents(self, enfileirar_mock):
        primeiro = self.criar_documento("primeiro.pdf")
        segundo = self.criar_documento("segundo.pdf")

        response = reindexar_base(self.request, self.base.id)

        self.assertEqual(response["total"], 2)
        enfileirar_mock.assert_called_once_with(self.base)

        primeiro.refresh_from_db()
        segundo.refresh_from_db()
        self.assertEqual(primeiro.status, Documento.StatusDocumento.PROCESSANDO)
        self.assertEqual(segundo.status, Documento.StatusDocumento.PROCESSANDO)

    @patch("apps.base_conhecimento.api.remover_chunks_base")
    def test_excluir_base_removes_base_documents_and_chunks(self, remover_base_mock):
        self.criar_documento()

        response = excluir_base(self.request, self.base.id)

        self.assertEqual(response["total"], 1)
        remover_base_mock.assert_called_once_with(self.base.id)
        self.assertFalse(Base_Conhecimento.objects.filter(id=self.base.id).exists())
        self.assertEqual(Documento.objects.count(), 0)
