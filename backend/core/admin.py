from django.contrib import admin

from apps.user.models import User
from apps.chat.models import Chat,Mensagem, Feedback
from apps.rag.models import ChunkDocumento
from apps.analytics.models import Feedback
from apps.base_conhecimento.models import Base_Conhecimento


admin.site.register(User)
admin.site.register(Chat)
admin.site.register(Mensagem)
admin.site.register(ChunkDocumento)
admin.site.register(Feedback)
admin.site.register(Base_Conhecimento)

