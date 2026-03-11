from django.db import models
from pgvector.django import VectorField
from django.contrib.postgres.search import SearchVectorField


class ChunkDocumento(models.Model):
    node_id = models.CharField(max_length=255, unique=True)
    text = models.TextField()
    embedding = VectorField(dimensions=1536)
    metadata = models.JSONField(default=dict)
    text_search_tsv = SearchVectorField(null=True, blank=True)
    mensagens = models.ManyToManyField(
        "chat.Mensagem",
        related_name="chunks_utilizados",
        blank=True
    )
