from ninja import Router, UploadedFile, Form, File
from django.core.files.storage import FileSystemStorage
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from .schemas import DocumentoSchemaOut, BaseConhecimentoIn
from .models import Documento, Base_Conhecimento
from apps.user.models import User

router = Router()

@router.get("/listarbase",response=list[BaseConhecimentoIn], tags=["Base Conhecimento"])
def listar_BaseConhecimento(request):
  return Base_Conhecimento.objects.all()

@router.post("/criarbase",response=BaseConhecimentoIn, tags=["Base Conhecimento"])
def criar_BaseConhecimento(request,titulo : str, versao : str, descricao : str):
  base = Base_Conhecimento(titulo = titulo, versao=versao, descricao =descricao,status="Ativo")
  base.save()
  return base

@router.post("/upload", tags=["Documento"])
def upload(request, base_id : int, user_id: str, file: File[UploadedFile]):
  user = get_object_or_404(User, id=user_id)
  base = get_object_or_404(Base_Conhecimento, id=base_id)

  doc = Documento(
    nome_documento = file.name,
    usuario=user,
    base=base,
    status="enviando",
    caminho = file.name #f"Base {base.id}/{file.name}" ideia de criar uma base para cada contexto
  )
  
  try:
    doc.full_clean()  # dispara o FileExtensionValidator do model
  except ValidationError as e:
    doc.status = "erro"
    doc.caminho = ""
    doc.save()
    
    return {"erro": e.message_dict}

  try:
    doc.status = "processando"
    doc.caminho.save(file.name, file, save=True)   
    
    doc.status = "concluido"
    doc.save()

  except Exception:
    doc.status = "erro"
    doc.save()
    raise

  return { "id": str(doc.id), "filename": file.name, "status": doc.status }