from django.db import models

# Create your models here.
class Chat(models.Model):
  titulo = models.TextField();
  data = models.DateTimeField(auto_now_add=True);
  usuario = models.ForeignKey(
        "user.User",
        on_delete=models.CASCADE,
        db_column="id_usuario",
        related_name="chats"
    )
  
  def __str__(self) :
    return self.titulo;

class Mensagem(models.Model):
  conteudo = models.TextField();
  role = models.TextField();
  pergunta_original = models.TextField(null=True, blank=True);
  intencao = models.TextField(null=True, blank=True);
  chat = models.ForeignKey(
        "chat.Chat",
        on_delete=models.CASCADE,
        db_column="id_chat",
        related_name="mensagens"
    )


class Feedback(models.Model):
  class MensagemFeedback(models.TextChoices):
    LIKE = "LIKE", "Like"
    DISLIKE = "DISLIKE", "Dislike"
  data = models.DateTimeField(auto_now_add=True);
  tipo = models.TextField(
    max_length=10,
    choices=MensagemFeedback.choices
  );
  mensagem_feedback = models.TextField();
  mensagem = models.OneToOneField(
        "chat.Mensagem",
        on_delete=models.CASCADE,
        db_column="id_mensagem",
        related_name="mensagem_referencia"
    )