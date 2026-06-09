from ninja import Router, UploadedFile, File
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .schemas import DocumentoSchemaOut, BaseConhecimentoIn, BaseConhecimentoOut, ErroSchema
from .models import Documento, Base_Conhecimento
from apps.base_conhecimento.tasks import processar_documento_rag
from core.permissions import require_staff

router = Router()

@router.get("/listarbase",response=list[BaseConhecimentoOut], tags=["Base Conhecimento"])
def listar_BaseConhecimento(request):
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
def criar_BaseConhecimento(request,titulo : str, versao : str, descricao : str):
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
