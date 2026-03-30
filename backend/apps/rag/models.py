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
        related_name="chunks_utilizados",
        blank=True
    )

    class Meta:
        # O LlamaIndex adiciona o prefixo "data_" automaticamente ao table_name.
        # Como usamos table_name="rag_chunkdocumento" no PGVectorStore,
        # a tabela real criada pelo LlamaIndex é "data_rag_chunkdocumento".
        db_table = "data_rag_chunkdocumento"
