from ninja import ModelSchema,Schema
from .models import Documento, Base_Conhecimento
from typing import Optional

class DocumentoSchemaOut(ModelSchema):
    caminho: Optional[str] = None
    
    class Meta:
        model = Documento
        fields = "__all__"

class BaseConhecimentoIn(ModelSchema):
    class Meta:
       model = Base_Conhecimento
       fields = ['titulo','descricao','versao']

class BaseConhecimentoOut(ModelSchema):    
    class Meta:
        model = Base_Conhecimento
        fields = "__all__"

class ErroSchema(Schema):
    erro: list[str]