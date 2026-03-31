from ninja import ModelSchema
from .models import Documento, Base_Conhecimento

class DocumentoSchemaOut(ModelSchema):
    class Meta:
        model = Documento
        fields = "__all__"

class BaseConhecimentoIn(ModelSchema):
    class Meta:
       model = Base_Conhecimento
       fields = ['titulo','descricao','versao']
