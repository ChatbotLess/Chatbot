from django.db import models

# Create your models here.
class User(models.Model):
  nome = models.TextField();
  tipo = models.TextField();
  email = models.TextField();
  
  def __str__(self) :
    return self.nome;