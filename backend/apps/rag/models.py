from django.db import models
from pgvector.django import VectorField
from django.contrib.postgres.search import SearchVectorField


class ChunkDocumento(models.Model):
    text = models.TextField()
    metadata = models.JSONField(default=dict, db_column="metadata_")
    node_id = models.CharField(max_length=255, unique=True)
    embedding = VectorField(dimensions=1536)
    text_search_tsv = SearchVectorField(null=True, blank=True)
    mensagens = models.ManyToManyField(
        "chat.Mensagem",
        through="MensagemChunk",
        related_name="chunks_utilizados",
        blank=True
    )

    class Meta:
        db_table = "data_rag_chunkdocumento"


class MensagemChunk(models.Model):
    chunk = models.ForeignKey(
        ChunkDocumento,
        on_delete=models.CASCADE,
        db_column="id_chunk",
        related_name="mensagem_chunks"
    )
    mensagem = models.ForeignKey(
        "chat.Mensagem",
        on_delete=models.CASCADE,
        db_column="id_mensagem",
        related_name="mensagem_chunks"
    )
    nome_arquivo = models.CharField(max_length=512, blank=True, default="")

    class Meta:
        db_table = "data_rag_mensagemchunk"
        unique_together = ("chunk", "mensagem")
