from ninja import Router, UploadedFile, Form, File
from django.core.files.storage import FileSystemStorage
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .schemas import DocumentoSchemaOut, BaseConhecimentoIn, ErroSchema
from .models import Documento, Base_Conhecimento
from apps.user.models import User

router = Router()

@router.get("/listarbase",response=list[BaseConhecimentoIn], tags=["Base Conhecimento"])
def listar_BaseConhecimento(request):
  return Base_Conhecimento.objects.all()

@router.post("/criarbase",response={200: BaseConhecimentoIn, 400: ErroSchema}, tags=["Base Conhecimento"])
def criar_BaseConhecimento(request,titulo : str, versao : str, descricao : str):
  base = Base_Conhecimento(
    titulo = titulo, 
    versao=versao, 
    descricao =descricao,
    status=Base_Conhecimento.StatusBaseDocumento.Ativo
  )
  try:
    base.full_clean()
    base.save()
  except ValidationError as e:
    return 400, {"erro": e.messages}

  return base

@router.post("/upload", tags=["Documento"])
def upload(request, base_id : int, user_id: str, file: File[UploadedFile], tipo: str):
  user = get_object_or_404(User, id=user_id)
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
    doc.caminho = None
    doc.save()
    
    return {"erro": e.message_dict}

  try:
    doc.status = Documento.StatusDocumento.PROCESSANDO
    doc.caminho.save(file.name, file, save=True)   
    
    doc.status = Documento.StatusDocumento.CONCLUIDO
    doc.save()

  except Exception:
    doc.status = Documento.StatusDocumento.ERRO
    doc.save()
    raise

  return { "id": str(doc.id), "filename": file.name, "status": doc.status }

@router.get('/listardocumentos', response=list[DocumentoSchemaOut], tags=["Documento"])
def listar_documentos(request):
  return Documento.objects.all()