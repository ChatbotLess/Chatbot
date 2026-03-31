from django.db import models
from django.core.validators import FileExtensionValidator

class Base_Conhecimento(models.Model):
  titulo = models.TextField();
  versao = models.TextField();
  data_criacao = models.DateTimeField(auto_now_add=True);
  descricao = models.TextField();
  status = models.TextField();

class Documento(models.Model):
  nome_documento = models.TextField();
  data_atualizacao = models.DateTimeField(auto_now_add=True);
  caminho = models.FileField(
      upload_to='./',
      max_length=255,
      validators=[FileExtensionValidator(['pdf'])],
  );
  status = models.TextField();
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
