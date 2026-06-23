from celery import shared_task
from django.db import close_old_connections

import gc
import logging

from apps.base_conhecimento.models import Base_Conhecimento, Documento
from apps.chat.text_processing import run_text_processing_flow
from apps.rag.services import (
    indexar_documento_no_rag,
    remover_chunks_base,
    remover_chunks_documento,
)


logger = logging.getLogger(__name__)


def _processar_documento_rag(documento_id, limpar_chunks=True):
    doc = Documento.objects.get(id=documento_id)

    try:
        doc.status = Documento.StatusDocumento.PROCESSANDO
        doc.save(update_fields=["status"])

        run_text_processing_flow(doc.caminho.path)

        if limpar_chunks:
            remover_chunks_documento(
                documento_id=doc.id,
                caminho=doc.caminho.path,
                base_id=doc.base.id,
            )

        indexar_documento_no_rag(
            caminho=doc.caminho.path,
            tipo=doc.tipo,
            data=doc.data_atualizacao,
            baseid=doc.base.id,
            documento_id=doc.id,
        )

        doc.status = Documento.StatusDocumento.CONCLUIDO
        doc.save(update_fields=["status"])
    except Exception:
        doc.status = Documento.StatusDocumento.ERRO
        doc.save(update_fields=["status"])
        raise


@shared_task
def processar_documento_rag(documento_id):
    _processar_documento_rag(documento_id)


@shared_task
def processar_base_rag(base_id):
    Base_Conhecimento.objects.get(id=base_id)
    documento_ids = list(
        Documento.objects.filter(base_id=base_id)
        .order_by("id")
        .values_list("id", flat=True)
    )

    remover_chunks_base(base_id)

    resultado = {
        "base_id": base_id,
        "total": len(documento_ids),
        "concluidos": 0,
        "erros": 0,
    }

    for documento_id in documento_ids:
        try:
            _processar_documento_rag(documento_id, limpar_chunks=False)
            resultado["concluidos"] += 1
        except Exception:
            logger.exception("Erro ao reindexar documento %s da base %s.", documento_id, base_id)
            resultado["erros"] += 1
        finally:
            close_old_connections()
            gc.collect()

    return resultado
