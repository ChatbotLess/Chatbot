from celery import shared_task

from apps.base_conhecimento.models import Documento
from apps.chat.text_processing import run_text_processing_flow
from apps.rag.services import indexar_documento_no_rag


@shared_task
def processar_documento_rag(documento_id):
    doc = Documento.objects.get(id=documento_id)

    try:
        doc.status = Documento.StatusDocumento.PROCESSANDO
        doc.save(update_fields=["status"])

        run_text_processing_flow(doc.caminho.path)

        indexar_documento_no_rag(
            caminho=doc.caminho.path,
            tipo=doc.tipo,
            data=doc.data_atualizacao,
        )

        doc.status = Documento.StatusDocumento.CONCLUIDO
        doc.save(update_fields=["status"])
    except Exception:
        doc.status = Documento.StatusDocumento.ERRO
        doc.save(update_fields=["status"])
        raise
