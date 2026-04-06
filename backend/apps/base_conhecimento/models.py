from django.db import models
from django.core.validators import FileExtensionValidator

class Base_Conhecimento(models.Model):
  class StatusBaseDocumento(models.TextChoices):
    Ativo = "ATIVO", "Ativo"
    Desativado = "DESATIVADO", "Desativado"  
    
  titulo = models.TextField();
  versao = models.TextField();
  data_criacao = models.DateTimeField(auto_now_add=True);
  descricao = models.TextField();
  status = models.TextField(
    choices=StatusBaseDocumento.choices
  );


class Documento(models.Model):
  class StatusDocumento(models.TextChoices):
    ENVIANDO = "ENVIANDO", "Enviando"
    PROCESSANDO = "PROCESSANDO", "Processando"
    CONCLUIDO = "CONCLUIDO", "Concluido"
    ERRO = "ERRO", "Erro"
  nome_documento = models.TextField();
  tipo = models.TextField(
    choices=[
      ("PORTARIA", "Portaria"),
      ("RESOLUCAO", "Resolucao"),
      ("ROD", "Rod"),
    ]
  )
  data_atualizacao = models.DateTimeField(auto_now_add=True);
  caminho = models.FileField(
      upload_to='./',
      max_length=255,
      validators=[FileExtensionValidator(['pdf'])],
  );
  status = models.TextField(
    choices=StatusDocumento.choices
  );
  usuario = models.ForeignKey(
        "user.User",
        on_delete=models.CASCADE,
        db_column="id_usuario",
        related_name="usuario_dono"
    )  
  base = models.ForeignKey(
        "base_conhecimento.Base_Conhecimento",
        on_delete=models.CASCADE,
        db_column="id_Base",
        related_name="base_pai"
    )  
