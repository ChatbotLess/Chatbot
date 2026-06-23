from io import BytesIO
from textwrap import wrap

from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.db.models import Count
from django.http import HttpResponse
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html
from django.utils.text import Truncator

from apps.analytics.models import Feedback as AnalyticsFeedback
from apps.base_conhecimento.models import Base_Conhecimento, Documento
from apps.chat.models import Chat, Feedback as ChatFeedback, Mensagem
from apps.rag.models import ChunkDocumento, MensagemChunk
from apps.user.models import User

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.pdfgen import canvas
except ImportError:
    A4 = None
    cm = None
    canvas = None


admin.site.site_header = "ChatbotLess Admin"
admin.site.site_title = "ChatbotLess"
admin.site.index_title = "Administracao do ChatbotLess"


def _local_datetime(value):
    if not value:
        return "-"
    return timezone.localtime(value).strftime("%d/%m/%Y %H:%M")


def _short(value, length=80):
    return Truncator(str(value or "")).chars(length)


def _admin_link(obj, label=None):
    if not obj:
        return "-"

    app_label = obj._meta.app_label
    model_name = obj._meta.model_name
    url = reverse(f"admin:{app_label}_{model_name}_change", args=[obj.pk])
    return format_html('<a href="{}">{}</a>', url, label or str(obj))


def _response_filename(prefix, extension):
    stamp = timezone.localtime(timezone.now()).strftime("%Y%m%d_%H%M%S")
    return f"{prefix}_{stamp}.{extension}"


def _text_response(filename, lines):
    response = HttpResponse("\n".join(lines), content_type="text/plain; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


def _pdf_response(filename, title, lines):
    if canvas is None:
        return _text_response(filename.replace(".pdf", ".txt"), lines)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    left = 2 * cm
    y = height - (2 * cm)

    def new_page():
        pdf.showPage()
        pdf.setFont("Helvetica", 10)
        return height - (2 * cm)

    def draw_line(text="", bold=False):
        nonlocal y
        font = "Helvetica-Bold" if bold else "Helvetica"
        pdf.setFont(font, 11 if bold else 10)

        wrapped_lines = wrap(str(text), width=105, replace_whitespace=False) or [""]
        for item in wrapped_lines:
            if y < 2 * cm:
                y = new_page()
                pdf.setFont(font, 11 if bold else 10)
            pdf.drawString(left, y, item[:150])
            y -= 0.48 * cm

    pdf.setTitle(title)
    draw_line(title, bold=True)
    draw_line(f"Gerado em: {_local_datetime(timezone.now())}")
    draw_line("")

    for line in lines:
        draw_line(line)

    pdf.save()
    buffer.seek(0)

    response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


def _message_lines(mensagem):
    lines = [
        f"Mensagem #{mensagem.id}",
        f"Role: {mensagem.role}",
        f"Chat: #{mensagem.chat_id} - {mensagem.chat.titulo}",
        f"Usuario: {mensagem.chat.usuario.email}",
    ]

    if mensagem.intencao:
        lines.append(f"Intencao: {mensagem.intencao}")

    if mensagem.pergunta_original:
        lines.extend(["Pergunta original:", mensagem.pergunta_original])

    lines.extend(["Conteudo:", mensagem.conteudo or ""])

    fontes = mensagem.mensagem_chunks.select_related("chunk").all()
    if fontes:
        lines.append("Fontes:")
        for fonte in fontes:
            metadata = fonte.chunk.metadata or {}
            nome_arquivo = (
                fonte.nome_arquivo
                or metadata.get("file_name")
                or metadata.get("nome_arquivo")
                or metadata.get("caminho")
                or "Documento sem nome"
            )
            lines.append(f"- {nome_arquivo} | chunk #{fonte.chunk_id}")

    try:
        feedback = mensagem.mensagem_referencia
    except ChatFeedback.DoesNotExist:
        feedback = None

    if feedback:
        lines.extend(
            [
                "Feedback:",
                f"- Tipo: {feedback.tipo}",
                f"- Comentario: {feedback.mensagem_feedback or '-'}",
            ]
        )

    return lines


def _chat_lines(chat):
    lines = [
        f"Chat #{chat.id}: {chat.titulo}",
        f"Usuario: {chat.usuario.email}",
        f"Criado em: {_local_datetime(chat.data)}",
        "",
        "Historico:",
    ]

    mensagens = (
        chat.mensagens.select_related("chat", "chat__usuario")
        .prefetch_related("mensagem_chunks__chunk")
        .order_by("id")
    )

    for mensagem in mensagens:
        lines.extend(["", "-" * 80])
        lines.extend(_message_lines(mensagem))

    return lines


def _feedback_lines(feedback):
    mensagem = feedback.mensagem
    chat = mensagem.chat
    comentario = getattr(feedback, "mensagem_feedback", None)
    comentario = comentario if comentario is not None else getattr(feedback, "feedback", "")

    return [
        f"Feedback #{feedback.id}",
        f"Tipo: {feedback.tipo}",
        f"Data: {_local_datetime(getattr(feedback, 'data', None))}",
        f"Usuario: {chat.usuario.email}",
        f"Chat: #{chat.id} - {chat.titulo}",
        f"Mensagem: #{mensagem.id} ({mensagem.role})",
        f"Comentario: {comentario or '-'}",
        "Conteudo da mensagem:",
        mensagem.conteudo or "",
    ]


def _base_lines(base):
    documentos = base.base_pai.select_related("usuario").order_by("id")
    total_chunks = ChunkDocumento.objects.filter(metadata__base=base.id).count()
    lines = [
        f"Base de conhecimento #{base.id}: {base.titulo}",
        f"Versao: {base.versao}",
        f"Status: {base.status}",
        f"Criada em: {_local_datetime(base.data_criacao)}",
        f"Documentos: {documentos.count()}",
        f"Chunks indexados: {total_chunks}",
        "",
        "Descricao:",
        base.descricao or "",
        "",
        "Documentos:",
    ]

    for documento in documentos:
        lines.append(
            (
                f"- #{documento.id} {documento.nome_documento} | "
                f"{documento.tipo} | {documento.status} | "
                f"{_local_datetime(documento.data_atualizacao)} | "
                f"{documento.usuario.email}"
            )
        )

    return lines


def _export_queryset(title, prefix, queryset, line_builder, as_pdf=False):
    lines = [title, f"Total de registros: {queryset.count()}", ""]

    for obj in queryset:
        lines.extend(line_builder(obj))
        lines.extend(["", "=" * 80, ""])

    filename = _response_filename(prefix, "pdf" if as_pdf else "txt")
    if as_pdf:
        return _pdf_response(filename, title, lines)
    return _text_response(filename, lines)


@admin.action(description="Exportar historico selecionado em TXT")
def exportar_historico_txt(modeladmin, request, queryset):
    queryset = queryset.select_related("usuario").prefetch_related("mensagens")
    return _export_queryset("Historico de chats", "historico_chats", queryset, _chat_lines)


@admin.action(description="Exportar historico selecionado em PDF")
def exportar_historico_pdf(modeladmin, request, queryset):
    queryset = queryset.select_related("usuario").prefetch_related("mensagens")
    return _export_queryset(
        "Historico de chats",
        "historico_chats",
        queryset,
        _chat_lines,
        as_pdf=True,
    )


@admin.action(description="Exportar mensagens selecionadas em TXT")
def exportar_mensagens_txt(modeladmin, request, queryset):
    queryset = queryset.select_related("chat", "chat__usuario").prefetch_related(
        "mensagem_chunks__chunk"
    )
    return _export_queryset("Mensagens", "mensagens", queryset, _message_lines)


@admin.action(description="Exportar mensagens selecionadas em PDF")
def exportar_mensagens_pdf(modeladmin, request, queryset):
    queryset = queryset.select_related("chat", "chat__usuario").prefetch_related(
        "mensagem_chunks__chunk"
    )
    return _export_queryset("Mensagens", "mensagens", queryset, _message_lines, as_pdf=True)


@admin.action(description="Exportar somente respostas selecionadas em TXT")
def exportar_respostas_txt(modeladmin, request, queryset):
    queryset = queryset.filter(role="assistant").select_related("chat", "chat__usuario")
    return _export_queryset("Respostas do chatbot", "respostas", queryset, _message_lines)


@admin.action(description="Exportar somente respostas selecionadas em PDF")
def exportar_respostas_pdf(modeladmin, request, queryset):
    queryset = queryset.filter(role="assistant").select_related("chat", "chat__usuario")
    return _export_queryset(
        "Respostas do chatbot",
        "respostas",
        queryset,
        _message_lines,
        as_pdf=True,
    )


@admin.action(description="Exportar relatorio de feedback em TXT")
def exportar_feedback_txt(modeladmin, request, queryset):
    queryset = queryset.select_related("mensagem", "mensagem__chat", "mensagem__chat__usuario")
    return _export_queryset("Relatorio de feedback", "relatorio_feedback", queryset, _feedback_lines)


@admin.action(description="Exportar relatorio de feedback em PDF")
def exportar_feedback_pdf(modeladmin, request, queryset):
    queryset = queryset.select_related("mensagem", "mensagem__chat", "mensagem__chat__usuario")
    return _export_queryset(
        "Relatorio de feedback",
        "relatorio_feedback",
        queryset,
        _feedback_lines,
        as_pdf=True,
    )


@admin.action(description="Exportar relatorio da base em TXT")
def exportar_bases_txt(modeladmin, request, queryset):
    return _export_queryset("Relatorio de bases de conhecimento", "relatorio_bases", queryset, _base_lines)


@admin.action(description="Exportar relatorio da base em PDF")
def exportar_bases_pdf(modeladmin, request, queryset):
    return _export_queryset(
        "Relatorio de bases de conhecimento",
        "relatorio_bases",
        queryset,
        _base_lines,
        as_pdf=True,
    )


class MensagemInline(admin.TabularInline):
    model = Mensagem
    fields = ("role", "conteudo_resumido", "intencao", "feedback_resumo")
    readonly_fields = fields
    extra = 0
    show_change_link = True

    @admin.display(description="Conteudo")
    def conteudo_resumido(self, obj):
        return _short(obj.conteudo, 100)

    @admin.display(description="Feedback")
    def feedback_resumo(self, obj):
        try:
            return obj.mensagem_referencia.tipo
        except ChatFeedback.DoesNotExist:
            return "-"

    def has_add_permission(self, request, obj=None):
        return False


class DocumentoInline(admin.TabularInline):
    model = Documento
    fields = ("nome_documento", "tipo", "status", "usuario", "data_atualizacao")
    readonly_fields = ("data_atualizacao",)
    extra = 0
    show_change_link = True


class MensagemChunkInline(admin.TabularInline):
    model = MensagemChunk
    fields = ("chunk_link", "nome_arquivo")
    readonly_fields = ("chunk_link",)
    raw_id_fields = ("chunk",)
    extra = 0

    @admin.display(description="Chunk")
    def chunk_link(self, obj):
        return _admin_link(obj.chunk, f"Chunk #{obj.chunk_id}")


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "name", "is_staff", "is_superuser", "total_chats", "created_at")
    list_filter = ("is_staff", "is_superuser", "created_at")
    search_fields = ("email", "name", "firebase_uid")
    ordering = ("email",)
    readonly_fields = ("id", "created_at", "updated_at", "last_login")

    fieldsets = (
        ("Conta", {"fields": ("id", "email", "password")}),
        ("Perfil", {"fields": ("name", "firebase_uid")}),
        ("Permissoes", {"fields": ("is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Datas", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (
            "Nova conta",
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "name",
                    "firebase_uid",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(chats_count=Count("chats", distinct=True))

    @admin.display(description="Chats", ordering="chats_count")
    def total_chats(self, obj):
        return obj.chats_count


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "titulo_resumido",
        "usuario_link",
        "data",
        "total_mensagens",
        "total_feedbacks",
    )
    list_select_related = ("usuario",)
    search_fields = ("titulo", "usuario__email", "usuario__name", "mensagens__conteudo")
    list_filter = ("data",)
    date_hierarchy = "data"
    inlines = (MensagemInline,)
    actions = (exportar_historico_txt, exportar_historico_pdf)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .annotate(
                mensagens_count=Count("mensagens", distinct=True),
                feedbacks_count=Count("mensagens__mensagem_referencia", distinct=True),
            )
        )

    @admin.display(description="Titulo", ordering="titulo")
    def titulo_resumido(self, obj):
        return _short(obj.titulo, 70)

    @admin.display(description="Usuario", ordering="usuario__email")
    def usuario_link(self, obj):
        return _admin_link(obj.usuario, obj.usuario.email)

    @admin.display(description="Mensagens", ordering="mensagens_count")
    def total_mensagens(self, obj):
        return obj.mensagens_count

    @admin.display(description="Feedbacks", ordering="feedbacks_count")
    def total_feedbacks(self, obj):
        return obj.feedbacks_count


@admin.register(Mensagem)
class MensagemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "role",
        "chat_link",
        "usuario_email",
        "conteudo_resumido",
        "intencao",
        "total_fontes",
        "feedback_resumo",
    )
    list_select_related = ("chat", "chat__usuario")
    search_fields = ("conteudo", "pergunta_original", "intencao", "chat__titulo", "chat__usuario__email")
    list_filter = ("role", "intencao", "chat__data")
    raw_id_fields = ("chat",)
    inlines = (MensagemChunkInline,)
    actions = (
        exportar_mensagens_txt,
        exportar_mensagens_pdf,
        exportar_respostas_txt,
        exportar_respostas_pdf,
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(fontes_count=Count("mensagem_chunks", distinct=True))

    @admin.display(description="Chat", ordering="chat__titulo")
    def chat_link(self, obj):
        return _admin_link(obj.chat, f"#{obj.chat_id} - {_short(obj.chat.titulo, 35)}")

    @admin.display(description="Usuario", ordering="chat__usuario__email")
    def usuario_email(self, obj):
        return obj.chat.usuario.email

    @admin.display(description="Conteudo")
    def conteudo_resumido(self, obj):
        return _short(obj.conteudo, 90)

    @admin.display(description="Fontes", ordering="fontes_count")
    def total_fontes(self, obj):
        return obj.fontes_count

    @admin.display(description="Feedback")
    def feedback_resumo(self, obj):
        try:
            feedback = obj.mensagem_referencia
        except ChatFeedback.DoesNotExist:
            return "-"
        return feedback.tipo


@admin.register(ChatFeedback)
class ChatFeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "tipo", "mensagem_link", "chat_link", "usuario_email", "data", "comentario_resumido")
    list_select_related = ("mensagem", "mensagem__chat", "mensagem__chat__usuario")
    search_fields = (
        "mensagem_feedback",
        "mensagem__conteudo",
        "mensagem__chat__titulo",
        "mensagem__chat__usuario__email",
    )
    list_filter = ("tipo", "data")
    date_hierarchy = "data"
    raw_id_fields = ("mensagem",)
    actions = (exportar_feedback_txt, exportar_feedback_pdf)

    @admin.display(description="Mensagem")
    def mensagem_link(self, obj):
        return _admin_link(obj.mensagem, f"Mensagem #{obj.mensagem_id}")

    @admin.display(description="Chat")
    def chat_link(self, obj):
        return _admin_link(obj.mensagem.chat, f"Chat #{obj.mensagem.chat_id}")

    @admin.display(description="Usuario")
    def usuario_email(self, obj):
        return obj.mensagem.chat.usuario.email

    @admin.display(description="Comentario")
    def comentario_resumido(self, obj):
        return _short(obj.mensagem_feedback, 80)


@admin.register(AnalyticsFeedback)
class AnalyticsFeedbackAdmin(admin.ModelAdmin):
    list_display = ("id", "tipo", "mensagem_link", "chat_link", "usuario_email", "data", "comentario_resumido")
    list_select_related = ("mensagem", "mensagem__chat", "mensagem__chat__usuario")
    search_fields = (
        "feedback",
        "mensagem__conteudo",
        "mensagem__chat__titulo",
        "mensagem__chat__usuario__email",
    )
    list_filter = ("tipo", "data")
    date_hierarchy = "data"
    raw_id_fields = ("mensagem",)
    actions = (exportar_feedback_txt, exportar_feedback_pdf)

    @admin.display(description="Mensagem")
    def mensagem_link(self, obj):
        return _admin_link(obj.mensagem, f"Mensagem #{obj.mensagem_id}")

    @admin.display(description="Chat")
    def chat_link(self, obj):
        return _admin_link(obj.mensagem.chat, f"Chat #{obj.mensagem.chat_id}")

    @admin.display(description="Usuario")
    def usuario_email(self, obj):
        return obj.mensagem.chat.usuario.email

    @admin.display(description="Comentario")
    def comentario_resumido(self, obj):
        return _short(obj.feedback, 80)


@admin.register(Base_Conhecimento)
class BaseConhecimentoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "titulo_resumido",
        "versao",
        "status",
        "data_criacao",
        "total_documentos",
        "total_chunks",
    )
    search_fields = ("titulo", "descricao", "versao")
    list_filter = ("status", "data_criacao")
    date_hierarchy = "data_criacao"
    inlines = (DocumentoInline,)
    actions = ("ativar_base", "desativar_bases", exportar_bases_txt, exportar_bases_pdf)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(documentos_count=Count("base_pai", distinct=True))

    @admin.display(description="Titulo", ordering="titulo")
    def titulo_resumido(self, obj):
        return _short(obj.titulo, 70)

    @admin.display(description="Documentos", ordering="documentos_count")
    def total_documentos(self, obj):
        return obj.documentos_count

    @admin.display(description="Chunks")
    def total_chunks(self, obj):
        return ChunkDocumento.objects.filter(metadata__base=obj.id).count()

    @admin.action(description="Ativar base selecionada")
    def ativar_base(self, request, queryset):
        if queryset.count() != 1:
            self.message_user(request, "Selecione exatamente uma base para ativar.", level=messages.ERROR)
            return None

        base = queryset.first()
        Base_Conhecimento.objects.exclude(pk=base.pk).update(
            status=Base_Conhecimento.StatusBaseDocumento.Desativado
        )
        base.status = Base_Conhecimento.StatusBaseDocumento.Ativo
        base.save(update_fields=["status"])
        self.message_user(request, f"Base '{base.titulo}' ativada.", level=messages.SUCCESS)
        return None

    @admin.action(description="Desativar bases selecionadas")
    def desativar_bases(self, request, queryset):
        total = queryset.update(status=Base_Conhecimento.StatusBaseDocumento.Desativado)
        self.message_user(request, f"{total} base(s) desativada(s).", level=messages.SUCCESS)


@admin.register(Documento)
class DocumentoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nome_documento_resumido",
        "tipo",
        "status",
        "base_link",
        "usuario_email",
        "data_atualizacao",
        "arquivo_link",
    )
    list_select_related = ("base", "usuario")
    search_fields = ("nome_documento", "tipo", "base__titulo", "usuario__email")
    list_filter = ("tipo", "status", "data_atualizacao", "base")
    date_hierarchy = "data_atualizacao"
    raw_id_fields = ("usuario", "base")
    readonly_fields = ("data_atualizacao",)

    @admin.display(description="Documento", ordering="nome_documento")
    def nome_documento_resumido(self, obj):
        return _short(obj.nome_documento, 70)

    @admin.display(description="Base", ordering="base__titulo")
    def base_link(self, obj):
        return _admin_link(obj.base, _short(obj.base.titulo, 35))

    @admin.display(description="Usuario", ordering="usuario__email")
    def usuario_email(self, obj):
        return obj.usuario.email

    @admin.display(description="Arquivo")
    def arquivo_link(self, obj):
        if not obj.caminho:
            return "-"
        return format_html('<a href="{}" target="_blank">abrir</a>', obj.caminho.url)


@admin.register(ChunkDocumento)
class ChunkDocumentoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "node_id_resumido",
        "arquivo",
        "base_metadata",
        "documento_metadata",
        "texto_resumido",
        "total_mensagens",
    )
    search_fields = ("node_id", "text")
    readonly_fields = ("metadata", "node_id", "text", "text_search_tsv", "total_mensagens")
    exclude = ("embedding", "mensagens")

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(mensagens_count=Count("mensagens", distinct=True))

    @admin.display(description="Node ID", ordering="node_id")
    def node_id_resumido(self, obj):
        return _short(obj.node_id, 50)

    @admin.display(description="Arquivo")
    def arquivo(self, obj):
        metadata = obj.metadata or {}
        return metadata.get("file_name") or metadata.get("nome_arquivo") or metadata.get("caminho") or "-"

    @admin.display(description="Base")
    def base_metadata(self, obj):
        return (obj.metadata or {}).get("base", "-")

    @admin.display(description="Documento")
    def documento_metadata(self, obj):
        return (obj.metadata or {}).get("documento_id", "-")

    @admin.display(description="Texto")
    def texto_resumido(self, obj):
        return _short(obj.text, 100)

    @admin.display(description="Mensagens", ordering="mensagens_count")
    def total_mensagens(self, obj):
        return obj.mensagens_count


@admin.register(MensagemChunk)
class MensagemChunkAdmin(admin.ModelAdmin):
    list_display = ("id", "mensagem_link", "chunk_link", "nome_arquivo")
    search_fields = ("nome_arquivo", "mensagem__conteudo", "chunk__node_id", "chunk__text")
    raw_id_fields = ("mensagem", "chunk")
    list_select_related = ("mensagem", "chunk")

    @admin.display(description="Mensagem")
    def mensagem_link(self, obj):
        return _admin_link(obj.mensagem, f"Mensagem #{obj.mensagem_id}")

    @admin.display(description="Chunk")
    def chunk_link(self, obj):
        return _admin_link(obj.chunk, f"Chunk #{obj.chunk_id}")
