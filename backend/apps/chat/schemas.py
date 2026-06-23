from pathlib import Path

from ninja import ModelSchema, Schema
from .models import Chat, Mensagem, Feedback

class ChatSchema(ModelSchema):
    class Meta:
        model = Chat
        fields = "__all__"


class MensagemFonteSchema(Schema):
    chunk_id: int
    node_id: str | None = None
    nome_arquivo: str
    tipo: str | None = None
    data: str | None = None
    trecho: str | None = None


def _nome_arquivo_fonte(mensagem_chunk):
    chunk = mensagem_chunk.chunk
    metadata = chunk.metadata or {}

    nome_arquivo = (
        mensagem_chunk.nome_arquivo
        or metadata.get("file_name")
        or metadata.get("nome_arquivo")
    )

    if nome_arquivo:
        return str(nome_arquivo)

    caminho = metadata.get("caminho")

    if caminho:
        return Path(str(caminho)).name

    return "Documento sem nome"


def _trecho_fonte(texto, limite=300):
    texto = " ".join(str(texto or "").split())

    if not texto:
        return None

    if len(texto) <= limite:
        return texto

    return f"{texto[:limite].rstrip()}..."


class MensagemSchemaOut(ModelSchema):
    fontes: list[MensagemFonteSchema] = []

    @staticmethod
    def resolve_fontes(obj):
        fontes = []
        vistos = set()

        for mensagem_chunk in obj.mensagem_chunks.all():
            chunk = mensagem_chunk.chunk
            metadata = chunk.metadata or {}
            chave = chunk.node_id or chunk.id

            if chave in vistos:
                continue

            vistos.add(chave)
            fontes.append(
                MensagemFonteSchema(
                    chunk_id=chunk.id,
                    node_id=chunk.node_id,
                    nome_arquivo=_nome_arquivo_fonte(mensagem_chunk),
                    tipo=metadata.get("tipo"),
                    data=metadata.get("data"),
                    trecho=_trecho_fonte(chunk.text),
                )
            )

        return fontes

    class Meta:
        model = Mensagem
        fields = "__all__"


class FeedbackSchemaIn(Schema):
    tipo: str
    mensagem_feedback: str | None = None


class FeedbackSchemaOut(ModelSchema):
    class Meta:
        model = Feedback
        fields = "__all__"
