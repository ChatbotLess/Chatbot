from ninja import Router, UploadedFile, File
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.utils import timezone
from .schemas import (
  DocumentoSchemaOut,
  BaseConhecimentoIn,
  BaseConhecimentoOut,
  BaseConhecimentoUpdateIn,
  DocumentoUpdateIn,
  OperacaoSchema,
  ErroSchema,
)
from .models import Documento, Base_Conhecimento
from apps.base_conhecimento.tasks import processar_base_rag, processar_documento_rag
from apps.rag.services import remover_chunks_base, remover_chunks_documento
from core.permissions import require_staff

router = Router()


def _erro_validacao(error):
  return {"erro": getattr(error, "messages", [str(error)])}


def _caminho_documento(documento):
  try:
    return documento.caminho.path if documento.caminho else None
  except ValueError:
    return None


def _remover_arquivo_documento(documento):
  if documento.caminho:
    documento.caminho.delete(save=False)


def _enfileirar_reindexacao_documento(documento):
  transaction.on_commit(lambda: processar_documento_rag.delay(documento.id))


def _enfileirar_reindexacao_base(base):
  transaction.on_commit(lambda: processar_base_rag.delay(base.id))

@router.get("/listarbase",response=list[BaseConhecimentoOut], tags=["Base Conhecimento"])
def listar_base_conhecimento(request):
  require_staff(request)
  return Base_Conhecimento.objects.all()

@router.post("/ativarbase",response={200: BaseConhecimentoOut, 400: ErroSchema}, tags=["Base Conhecimento"])
def ativar_base(request, baseID: int):
    require_staff(request)
    # desativa a atual
    Base_Conhecimento.objects.filter(
        status=Base_Conhecimento.StatusBaseDocumento.Ativo
    ).update(
        status=Base_Conhecimento.StatusBaseDocumento.Desativado
    )
    # pega a nova base
    base = get_object_or_404(Base_Conhecimento, id=baseID)
    try:
      base.status = Base_Conhecimento.StatusBaseDocumento.Ativo
      base.full_clean()
      base.save()
    except ValidationError as e:
      return 400, {"erro": e.messages}

    return base
  
@router.post("/desativarbase",response={200: BaseConhecimentoOut, 400: ErroSchema}, tags=["Base Conhecimento"])
def desativar_base(request, baseID: int):
    require_staff(request)
    base = get_object_or_404(Base_Conhecimento, id=baseID)
    try:
        base.status = Base_Conhecimento.StatusBaseDocumento.Desativado
        base.full_clean()
        base.save()

    except ValidationError as e:
        return 400, {"erro": e.messages}

    return base


@router.post("/criarbase",response={200: BaseConhecimentoOut, 400: ErroSchema}, tags=["Base Conhecimento"])
def criar_base_conhecimento(request,titulo : str, versao : str, descricao : str):
  require_staff(request)
  base = Base_Conhecimento(
    titulo = titulo, 
    versao = versao, 
    descricao = descricao,
    status = Base_Conhecimento.StatusBaseDocumento.Desativado
  )
  
  try:
    Base_Conhecimento.objects.filter(
      status=Base_Conhecimento.StatusBaseDocumento.Ativo
    ).update(
      status=Base_Conhecimento.StatusBaseDocumento.Desativado
    )
    base.status = Base_Conhecimento.StatusBaseDocumento.Ativo
    base.full_clean()
    base.save()
  except ValidationError as e:
    return 400, {"erro": e.messages}

  return base


@router.put("/atualizarbase",response={200: BaseConhecimentoOut, 400: ErroSchema}, tags=["Base Conhecimento"])
def atualizar_base(request, baseID: int, payload: BaseConhecimentoUpdateIn):
  require_staff(request)
  base = get_object_or_404(Base_Conhecimento, id=baseID)

  base.titulo = payload.titulo.strip()
  base.versao = payload.versao.strip()
  base.descricao = payload.descricao.strip()

  try:
    base.full_clean()
    base.save()
  except ValidationError as e:
    return 400, _erro_validacao(e)

  return base


@router.delete("/excluirbase",response={200: OperacaoSchema}, tags=["Base Conhecimento"])
def excluir_base(request, baseID: int):
  require_staff(request)
  base = get_object_or_404(Base_Conhecimento, id=baseID)
  documentos = list(base.base_pai.all())

  with transaction.atomic():
    remover_chunks_base(base.id)
    for documento in documentos:
      _remover_arquivo_documento(documento)
    base.delete()

  return {"mensagem": "Base de conhecimento excluida.", "total": len(documentos)}


@router.post("/reindexarbase",response={200: OperacaoSchema}, tags=["Base Conhecimento"])
def reindexar_base(request, baseID: int):
  require_staff(request)
  base = get_object_or_404(Base_Conhecimento, id=baseID)
  documentos = list(base.base_pai.all())

  with transaction.atomic():
    for documento in documentos:
      documento.status = Documento.StatusDocumento.PROCESSANDO
      documento.data_atualizacao = timezone.now()
      documento.save(update_fields=["status", "data_atualizacao"])
    _enfileirar_reindexacao_base(base)

  return {"mensagem": "Reindexacao da base enfileirada.", "total": len(documentos)}

@router.post("/upload", tags=["Documento"])
def upload(request, base_id: int, file: File[UploadedFile], tipo: str):
  user = require_staff(request)
  base = get_object_or_404(Base_Conhecimento, id=base_id)
  tipo = tipo.upper()
  doc = Documento(
    nome_documento = file.name,
    tipo=tipo,
    usuario=user,
    base=base,
    status=Documento.StatusDocumento.ENVIANDO,
    caminho = file.name #f"Base {base.id}/{file.name}" ideia de criar uma base para cada contexto
  )
  
  try:
    doc.full_clean()  # dispara o FileExtensionValidator do model
  except ValidationError as e:
    doc.status = Documento.StatusDocumento.ERRO
    doc.save()
    
    return {"erro": e.message_dict}

  try:
    doc.status = Documento.StatusDocumento.PROCESSANDO
    with transaction.atomic():
      doc.caminho.save(file.name, file, save=True)
      transaction.on_commit(lambda: processar_documento_rag.delay(doc.id))
  except Exception as e:
    doc.status = Documento.StatusDocumento.ERRO
    doc.save(update_fields=["status"])
    return {"erro": str(e)}

  return { "id": str(doc.id), "filename": file.name, "status": doc.status }

@router.get('/listardocumentos', response=list[DocumentoSchemaOut], tags=["Documento"])
def listar_documentos(request):
  require_staff(request)
  return Documento.objects.all()


@router.get('/listardocumentosbase', response=list[DocumentoSchemaOut], tags=["Documento"])
def listar_documentos_base(request, baseID):
  require_staff(request)
  return Documento.objects.filter(base_id=baseID)


@router.put("/atualizardocumento",response={200: DocumentoSchemaOut, 400: ErroSchema}, tags=["Documento"])
def atualizar_documento(request, documentoID: int, payload: DocumentoUpdateIn):
  require_staff(request)
  documento = get_object_or_404(Documento, id=documentoID)

  documento.nome_documento = payload.nome_documento.strip()
  documento.tipo = payload.tipo.strip().upper()
  documento.status = Documento.StatusDocumento.PROCESSANDO
  documento.data_atualizacao = timezone.now()

  try:
    documento.full_clean()
    with transaction.atomic():
      caminho = _caminho_documento(documento)
      remover_chunks_documento(
        documento_id=documento.id,
        caminho=caminho,
        base_id=documento.base.id,
      )
      documento.save()
      _enfileirar_reindexacao_documento(documento)
  except ValidationError as e:
    return 400, _erro_validacao(e)

  return documento


@router.delete("/excluirdocumento",response={200: OperacaoSchema}, tags=["Documento"])
def excluir_documento(request, documentoID: int):
  require_staff(request)
  documento = get_object_or_404(Documento, id=documentoID)
  caminho = _caminho_documento(documento)

  with transaction.atomic():
    remover_chunks_documento(
      documento_id=documento.id,
      caminho=caminho,
      base_id=documento.base.id,
    )
    _remover_arquivo_documento(documento)
    documento.delete()

  return {"mensagem": "Documento excluido.", "total": 1}


@router.post("/reindexardocumento",response={200: DocumentoSchemaOut}, tags=["Documento"])
def reindexar_documento(request, documentoID: int):
  require_staff(request)
  documento = get_object_or_404(Documento, id=documentoID)
  caminho = _caminho_documento(documento)

  with transaction.atomic():
    remover_chunks_documento(
      documento_id=documento.id,
      caminho=caminho,
      base_id=documento.base.id,
    )
    documento.status = Documento.StatusDocumento.PROCESSANDO
    documento.data_atualizacao = timezone.now()
    documento.save(update_fields=["status", "data_atualizacao"])
    _enfileirar_reindexacao_documento(documento)

  return documento
