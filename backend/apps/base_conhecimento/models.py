from django.db import models

# Create your models here.

class Base_Conhecimento(models.Model):
  titulo = models.TextField();
  data_atualizacao = models.DateTimeField(auto_now_add=True);
  descricao = models.TextField();
  status = models.TextField();

class Documento(models.Model):
  data_atualizacao = models.DateTimeField(auto_now_add=True);
  caminho = models.TextField();
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
