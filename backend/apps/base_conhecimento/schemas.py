from ninja import ModelSchema
from .models import Documento

class DocumentoSchemaOut(ModelSchema):
    class Meta:
        model = Documento
        fields = "__all__"
