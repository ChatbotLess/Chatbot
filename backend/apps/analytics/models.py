from django.db import models

# Create your models here.
class Feedback(models.Model):
  data = models.DateTimeField(auto_now_add=True);
  tipo = models.TextField();
  feedback = models.TextField();
  mensagem = models.OneToOneField(
        "chat.Mensagem",
        on_delete=models.CASCADE,
        db_column="id_Mensagem",
        related_name="feedbackmensagem"
    )
  
  def __str__(self) :
    return f"Feedback {self.id} - {self.tipo}"