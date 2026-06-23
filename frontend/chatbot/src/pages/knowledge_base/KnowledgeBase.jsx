import { Fragment, useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaDatabase,
  FaEdit,
  FaFileAlt,
  FaFolder,
  FaFolderOpen,
  FaLayerGroup,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import * as Switch from "@radix-ui/react-switch";
import { CreateKnowledgeBaseModal } from "../../components/knowledge_base/CreateKnowledgeBaseModal";
import {
  useActivateBase,
  useCreateBase,
  useDeactivateBase,
  useDeleteBase,
  useDeleteDocument,
  useKnowledgeBaseDocuments,
  useKnowledgeBases,
  useReindexBase,
  useReindexDocument,
  useUpdateBase,
  useUpdateDocument,
} from "../../hooks/useKnowledgeBase";

function formatDate(raw) {
  if (!raw) return "-";

  const date = new Date(raw);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ icon, label, value, accent }) {
  const Icon = icon;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent}`}
      >
        <Icon className="text-lg" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-0.5 truncate text-lg font-semibold text-gray-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function getStatusClasses(status) {
  if (status === "CONCLUIDO") {
    return "bg-ifes-green-500/15 text-ifes-green-700";
  }

  if (status === "PROCESSANDO") {
    return "bg-amber-500/15 text-amber-700";
  }

  if (status === "ERRO") {
    return "bg-ifes-red-500/15 text-ifes-red-700";
  }

  return "bg-ifes-green-500/15 text-ifes-green-700";
}

function getErrorMessage(error, fallback) {
  const responseData = error?.response?.data;

  if (Array.isArray(responseData?.erro)) return responseData.erro.join(" ");
  if (typeof responseData?.erro === "string") return responseData.erro;
  if (Array.isArray(responseData?.detail)) {
    return responseData.detail.map((item) => item?.msg).filter(Boolean).join(" ");
  }

  return error?.message || fallback;
}

function DocumentRow({ doc, onEdit, onDelete, onReindex, isMutating }) {
  return (
    <div
      className="group flex flex-wrap items-center gap-3 rounded-lg border border-transparent px-3 py-3 transition-all duration-200 hover:border-gray-200 hover:bg-gray-100 xs:px-4"
      data-cy="knowledge-document"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ifes-green-500/10 text-ifes-green-700">
        <FaFileAlt className="text-sm" />
      </div>

      <div className="min-w-[10rem] flex-1">
        <p className="truncate text-sm font-medium text-gray-800 group-hover:text-gray-950">
          {doc.nome_documento || "Documento sem titulo"}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{doc.tipo || "Geral"}</p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${getStatusClasses(
          doc.status
        )}`}
      >
        {doc.status || "-"}
      </span>

      <span className="shrink-0 text-xs text-gray-500">
        {formatDate(doc.data_atualizacao)}
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Editar documento"
          title="Editar documento"
          disabled={isMutating}
          onClick={() => onEdit(doc)}
          className="rounded-md p-2 text-gray-500 transition hover:bg-white hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaEdit className="text-xs" />
        </button>
        <button
          type="button"
          aria-label="Reindexar documento"
          title="Reindexar documento"
          disabled={isMutating}
          onClick={() => onReindex(doc)}
          className="rounded-md p-2 text-gray-500 transition hover:bg-white hover:text-ifes-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaSyncAlt className="text-xs" />
        </button>
        <button
          type="button"
          aria-label="Excluir documento"
          title="Excluir documento"
          disabled={isMutating}
          onClick={() => onDelete(doc)}
          className="rounded-md p-2 text-gray-500 transition hover:bg-white hover:text-ifes-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-red-500/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaTrash className="text-xs" />
        </button>
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-gray-500">
      <div className="relative">
        <FaFolder className="text-6xl text-gray-300 opacity-90" />
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500">
          ?
        </div>
      </div>
      <div>
        <p className="text-lg font-medium text-gray-700">
          Selecione uma base de conhecimento
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Clique em uma base a esquerda para ver seus detalhes e documentos
        </p>
      </div>
    </div>
  );
}

function EditDocumentModal({ document, isPending, error, onClose, onSubmit }) {
  const [nomeDocumento, setNomeDocumento] = useState("");
  const [tipo, setTipo] = useState("PORTARIA");

  useEffect(() => {
    if (!document) return;

    setNomeDocumento(document.nome_documento ?? "");
    setTipo(document.tipo ?? "PORTARIA");
  }, [document]);

  if (!document) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      nome_documento: nomeDocumento.trim(),
      tipo,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-document-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-gray-300 bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-document-title" className="text-lg font-semibold text-gray-950">
              Editar documento
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Alterar nome ou tipo reindexa o documento.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <FaTimes />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="document-name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              id="document-name"
              type="text"
              value={nomeDocumento}
              onChange={(event) => setNomeDocumento(event.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-ifes-green-500 focus:ring-2 focus:ring-ifes-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="document-type" className="mb-1.5 block text-sm font-medium text-gray-700">
              Tipo
            </label>
            <select
              id="document-type"
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
              disabled={isPending}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-ifes-green-500 focus:ring-2 focus:ring-ifes-green-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="PORTARIA">Portaria</option>
              <option value="RESOLUCAO">Resolucao</option>
              <option value="ROD">ROD</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-ifes-red-200 bg-ifes-red-50 px-3 py-2 text-sm text-ifes-red-700">
              {getErrorMessage(error, "Nao foi possivel atualizar o documento.")}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 xs:flex-row xs:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !nomeDocumento.trim()}
              className="rounded-lg bg-ifes-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ifes-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({
  target,
  isPending,
  error,
  onClose,
  onConfirm,
}) {
  if (!target) return null;

  const isBase = target.type === "base";
  const title = isBase ? "Excluir base de conhecimento" : "Excluir documento";
  const name = isBase
    ? target.item?.titulo || "Base sem nome"
    : target.item?.nome_documento || "Documento sem titulo";
  const description = isBase
    ? "Esta acao remove a base, seus documentos e os chunks indexados no RAG."
    : "Esta acao remove o arquivo e os chunks indexados no RAG.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirmation-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-gray-300 bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ifes-red-500/15 text-ifes-red-700">
              <FaTrash />
            </div>
            <div>
              <h2
                id="delete-confirmation-title"
                className="text-lg font-semibold text-gray-950"
              >
                {title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                Tem certeza que deseja excluir <strong>{name}</strong>?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-ifes-red-200 bg-ifes-red-50 px-3 py-2 text-sm text-ifes-red-700">
            {getErrorMessage(error, "Nao foi possivel excluir.")}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 xs:flex-row xs:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-lg bg-ifes-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ifes-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-red-500/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BaseListItem({ base, isSelected, onSelect, onToggle, isToggling }) {
  const isActive = base.status === "ATIVO";

  return (
    <div
      className={`group flex w-full gap-3 rounded-xl border px-3 py-3.5 text-left transition-all duration-200 xs:px-4 ${
        isSelected
          ? "border-ifes-green-500/40 bg-ifes-green-500/10 shadow-lg shadow-ifes-green-500/5"
          : "border-transparent hover:border-gray-200 hover:bg-gray-100"
      }`}
      style={isSelected ? { borderLeftWidth: "3px" } : {}}
    >
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={() => onSelect(base)}
        className="flex min-w-0 flex-1 cursor-pointer gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60"
        data-cy="knowledge-base-item"
      >
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isSelected
              ? "bg-ifes-green-500/20 text-ifes-green-700"
              : "bg-gray-100 text-gray-600 group-hover:text-gray-700"
          }`}
        >
          <FaDatabase className="text-sm" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold ${
              isSelected
                ? "text-gray-950"
                : "text-gray-800 group-hover:text-gray-950"
            }`}
          >
            {base.titulo || "Base sem nome"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {base.descricao || "Sem descricao"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600">
            <span className="flex items-center gap-1">
              <FaFileAlt className="text-[10px]" />
              {base.versao || "-"}
            </span>
            <span className="flex items-center gap-1">
              <FaClock className="text-[10px]" />
              {formatDate(base.data_criacao)}
            </span>
          </div>
        </div>
      </button>

      <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
        <Switch.Root
          checked={isActive}
          disabled={isToggling}
          onCheckedChange={() => onToggle(base)}
          className={`relative h-[22px] w-[40px] cursor-pointer rounded-full outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ifes-green-500 disabled:cursor-not-allowed disabled:opacity-50 ${
            isActive ? "bg-ifes-green-500" : "bg-gray-200"
          }`}
        >
          <Switch.Thumb
            className={`block h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-300 will-change-transform ${
              isActive ? "translate-x-[20px]" : "translate-x-[2px]"
            }`}
          />
        </Switch.Root>
        <span
          className={`text-[10px] font-medium uppercase tracking-wider ${
            isActive ? "text-ifes-green-700" : "text-gray-600"
          }`}
        >
          {isActive ? "Ativa" : "Inativa"}
        </span>
      </div>
    </div>
  );
}

function DetailPanel({
  base,
  onEditBase,
  onDeleteBase,
  onReindexBase,
  onEditDocument,
  onDeleteDocument,
  onReindexDocument,
  isActionPending,
}) {
  const isActive = base.status === "ATIVO";
  const {
    data: documents,
    isLoading: loadingDocs,
    isError: documentsError,
  } = useKnowledgeBaseDocuments(base.id, true);

  return (
    <div className="flex h-full flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-200">
      <div className="shrink-0 border-b border-gray-200 p-4 md:p-6">
        <div className="flex flex-col gap-4 xs:flex-row xs:items-start xs:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <FaFolderOpen className="shrink-0 text-2xl text-ifes-green-700" />
              <h2 className="truncate text-lg font-bold text-gray-950 xs:text-xl">
                {base.titulo || "Base sem nome"}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {base.descricao || "Sem descricao disponivel."}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isActive
                  ? "bg-ifes-green-500/15 text-ifes-green-700 ring-1 ring-ifes-green-500/30"
                  : "bg-gray-100 text-gray-500 ring-1 ring-gray-300"
              }`}
            >
              {isActive ? "Ativa" : "Inativa"}
            </span>
            <button
              type="button"
              aria-label="Editar base"
              title="Editar base"
              disabled={isActionPending}
              onClick={() => onEditBase(base)}
              className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaEdit className="text-sm" />
            </button>
            <button
              type="button"
              aria-label="Reindexar base"
              title="Reindexar base"
              disabled={isActionPending}
              onClick={() => onReindexBase(base)}
              className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-ifes-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaSyncAlt className="text-sm" />
            </button>
            <button
              type="button"
              aria-label="Excluir base"
              title="Excluir base"
              disabled={isActionPending}
              onClick={() => onDeleteBase(base)}
              className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-ifes-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-red-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-3 p-4 sm:grid-cols-3 md:p-6">
        <StatCard
          icon={FaLayerGroup}
          label="Versao"
          value={base.versao || "-"}
          accent="bg-ifes-green-500/15 text-ifes-green-700"
        />
        <StatCard
          icon={FaCalendarAlt}
          label="Criacao"
          value={formatDate(base.data_criacao)}
          accent="bg-violet-500/15 text-violet-700"
        />
        <StatCard
          icon={FaClock}
          label="Status"
          value={isActive ? "Ativa" : "Inativa"}
          accent={
            isActive
              ? "bg-ifes-green-500/15 text-ifes-green-700"
              : "bg-gray-200 text-gray-600"
          }
        />
      </div>

      <div className="min-h-0 flex-1 px-4 pb-4 md:px-6 md:pb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
            <FaFileAlt className="text-xs" />
            Documentos Recentes
          </h3>
          <span
            className="rounded-lg border border-ifes-green-500/30 bg-ifes-green-500/10 px-3 py-1 text-xs text-ifes-green-700"
            data-cy="knowledge-documents-count"
          >
            {documents?.length ?? 0} documentos
          </span>
        </div>

        {loadingDocs && (
          <div
            className="flex flex-col gap-2"
            data-cy="knowledge-documents-loading"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        )}

        {documentsError && (
          <div
            className="rounded-xl border border-ifes-red-200 bg-ifes-red-50 p-4 text-sm text-ifes-red-700"
            data-cy="knowledge-documents-error"
          >
            Erro ao carregar os documentos desta base.
          </div>
        )}

        {!loadingDocs &&
          !documentsError &&
          (!documents || documents.length === 0) && (
            <div
              className="rounded-xl border border-dashed border-gray-200 py-10 text-center"
              data-cy="knowledge-documents-empty-state"
            >
              <FaFileAlt className="mx-auto text-3xl text-gray-700" />
              <p className="mt-3 text-sm text-gray-500">
                Nenhum documento encontrado nesta base
              </p>
            </div>
          )}

        {!loadingDocs && !documentsError && documents && documents.length > 0 && (
          <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {documents.map((doc, index) => (
              <DocumentRow
                key={doc.id ?? index}
                doc={doc}
                isMutating={isActionPending}
                onEdit={onEditDocument}
                onDelete={onDeleteDocument}
                onReindex={onReindexDocument}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function KnowledgeBase() {
  const { data: bases, isLoading, isError } = useKnowledgeBases();
  const activateMutation = useActivateBase();
  const deactivateMutation = useDeactivateBase();
  const createMutation = useCreateBase();
  const updateBaseMutation = useUpdateBase();
  const deleteBaseMutation = useDeleteBase();
  const reindexBaseMutation = useReindexBase();
  const updateDocumentMutation = useUpdateDocument();
  const deleteDocumentMutation = useDeleteDocument();
  const reindexDocumentMutation = useReindexDocument();

  const [selectedBaseId, setSelectedBaseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBase, setEditingBase] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sortedBases = useMemo(() => {
    if (!bases) return [];
    return [...bases].sort((a, b) => a.id - b.id);
  }, [bases]);

  const filteredBases = useMemo(() => {
    if (!searchQuery.trim()) return sortedBases;

    const query = searchQuery.toLowerCase();
    return sortedBases.filter(
      (base) =>
        (base.titulo || "").toLowerCase().includes(query) ||
        (base.descricao || "").toLowerCase().includes(query)
    );
  }, [searchQuery, sortedBases]);

  const selectedBase = useMemo(
    () => sortedBases.find((base) => base.id === selectedBaseId) ?? null,
    [selectedBaseId, sortedBases]
  );

  const totalBases = bases?.length ?? 0;
  const activeBases = bases?.filter((base) => base.status === "ATIVO").length ?? 0;
  const isToggling = activateMutation.isPending || deactivateMutation.isPending;
  const isActionPending =
    isToggling ||
    updateBaseMutation.isPending ||
    deleteBaseMutation.isPending ||
    reindexBaseMutation.isPending ||
    updateDocumentMutation.isPending ||
    deleteDocumentMutation.isPending ||
    reindexDocumentMutation.isPending;

  const handleToggle = async (base) => {
    try {
      if (base.status === "ATIVO") {
        await deactivateMutation.mutateAsync(base.id);
      } else {
        await activateMutation.mutateAsync(base.id);
      }
    } catch (error) {
      console.error("Erro ao alterar status da base:", error);
    }
  };

  const handleCreateBase = async (formData) => {
    const createdBase = await createMutation.mutateAsync({
      titulo: formData.titulo.trim(),
      versao: formData.versao.trim(),
      descricao: formData.descricao.trim(),
    });

    setSelectedBaseId(createdBase.id);
    setSearchQuery("");
    setIsCreateModalOpen(false);
  };

  const handleUpdateBase = async (formData) => {
    if (!editingBase) return;

    const updatedBase = await updateBaseMutation.mutateAsync({
      baseID: editingBase.id,
      titulo: formData.titulo.trim(),
      versao: formData.versao.trim(),
      descricao: formData.descricao.trim(),
    });

    setSelectedBaseId(updatedBase.id);
    setEditingBase(null);
  };

  const handleDeleteBase = (base) => {
    deleteBaseMutation.reset();
    setDeleteTarget({ type: "base", item: base });
  };

  const handleReindexBase = async (base) => {
    await reindexBaseMutation.mutateAsync(base.id);
  };

  const handleUpdateDocument = async (formData) => {
    if (!editingDocument) return;

    await updateDocumentMutation.mutateAsync({
      documentoID: editingDocument.id,
      nome_documento: formData.nome_documento,
      tipo: formData.tipo,
    });
    setEditingDocument(null);
  };

  const handleDeleteDocument = (document) => {
    deleteDocumentMutation.reset();
    setDeleteTarget({ type: "document", item: document });
  };

  const handleReindexDocument = async (document) => {
    await reindexDocumentMutation.mutateAsync({
      documentoID: document.id,
    });
  };

  const handleCloseCreateModal = () => {
    if (createMutation.isPending) return;

    createMutation.reset();
    setIsCreateModalOpen(false);
  };

  const handleCloseEditBaseModal = () => {
    if (updateBaseMutation.isPending) return;

    updateBaseMutation.reset();
    setEditingBase(null);
  };

  const handleCloseEditDocumentModal = () => {
    if (updateDocumentMutation.isPending) return;

    updateDocumentMutation.reset();
    setEditingDocument(null);
  };

  const handleCloseDeleteModal = () => {
    if (deleteBaseMutation.isPending || deleteDocumentMutation.isPending) return;

    deleteBaseMutation.reset();
    deleteDocumentMutation.reset();
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "base") {
      await deleteBaseMutation.mutateAsync(deleteTarget.item.id);
      if (selectedBaseId === deleteTarget.item.id) {
        setSelectedBaseId(null);
      }
    } else {
      await deleteDocumentMutation.mutateAsync({
        documentoID: deleteTarget.item.id,
        baseID: deleteTarget.item.base,
      });
    }

    setDeleteTarget(null);
  };

  return (
    <div className="flex h-full min-h-0 bg-gray-50" data-cy="knowledge-base-page">
      <div className="flex w-full min-w-0 flex-col border-r border-gray-200 md:w-[40%] md:min-w-[340px] md:max-w-[500px]">
        <div className="shrink-0 border-b border-gray-200 p-4 xs:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-950 xs:text-xl">
                Bases de Conhecimento
              </h1>
              <p className="mt-1 text-xs text-gray-500">
                Gerencie as bases de dados de conhecimento do chatbot
              </p>
            </div>

            <button
              type="button"
              data-cy="create-knowledge-base"
              onClick={() => {
                createMutation.reset();
                setIsCreateModalOpen(true);
              }}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-ifes-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-ifes-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60"
            >
              <FaPlus className="text-xs" />
              <span className="hidden xs:inline">Nova base</span>
            </button>
          </div>

          <div className="relative mt-4">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou descricao..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors hover:border-gray-300 focus:border-ifes-green-500/50 focus:ring-1 focus:ring-ifes-green-500/20"
              data-cy="knowledge-search"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-200">
          {isLoading && (
            <div className="flex flex-col gap-2 px-1" data-cy="knowledge-loading">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          )}

          {isError && (
            <div
              className="mx-1 rounded-xl border border-ifes-red-200 bg-ifes-red-50 p-4 text-center text-sm text-ifes-red-700"
              data-cy="knowledge-error"
            >
              Erro ao carregar as bases de conhecimento.
            </div>
          )}

          {!isLoading && !isError && filteredBases.length === 0 && (
            <div
              className="mx-1 rounded-xl border border-dashed border-gray-200 py-10 text-center"
              data-cy="knowledge-empty-state"
            >
              <FaDatabase className="mx-auto text-3xl text-gray-700" />
              <p className="mt-3 text-sm text-gray-500">
                {searchQuery
                  ? "Nenhuma base encontrada para esta busca"
                  : "Nenhuma base de conhecimento cadastrada"}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {filteredBases.map((base) => (
              <Fragment key={base.id}>
                <BaseListItem
                  base={base}
                  isSelected={selectedBaseId === base.id}
                  isToggling={isToggling}
                  onSelect={(selected) => setSelectedBaseId(selected.id)}
                  onToggle={handleToggle}
                />
                {selectedBaseId === base.id && (
                  <div className="my-2 overflow-hidden rounded-xl border border-gray-200 bg-white md:hidden">
                    <DetailPanel
                      base={base}
                      isActionPending={isActionPending}
                      onEditBase={setEditingBase}
                      onDeleteBase={handleDeleteBase}
                      onReindexBase={handleReindexBase}
                      onEditDocument={setEditingDocument}
                      onDeleteDocument={handleDeleteDocument}
                      onReindexDocument={handleReindexDocument}
                    />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-200 px-5 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Total:{" "}
              <span className="font-semibold text-gray-700">{totalBases}</span>{" "}
              bases
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ifes-green-500" />
              <span className="font-semibold text-ifes-green-700">
                {activeBases}
              </span>{" "}
              ativa{activeBases !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden flex-1 md:block">
        {selectedBase ? (
          <DetailPanel
            base={selectedBase}
            isActionPending={isActionPending}
            onEditBase={setEditingBase}
            onDeleteBase={handleDeleteBase}
            onReindexBase={handleReindexBase}
            onEditDocument={setEditingDocument}
            onDeleteDocument={handleDeleteDocument}
            onReindexDocument={handleReindexDocument}
          />
        ) : (
          <EmptyDetail />
        )}
      </div>

      <CreateKnowledgeBaseModal
        isOpen={isCreateModalOpen}
        isPending={createMutation.isPending}
        error={createMutation.error}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateBase}
      />
      <CreateKnowledgeBaseModal
        isOpen={Boolean(editingBase)}
        isPending={updateBaseMutation.isPending}
        error={updateBaseMutation.error}
        initialValues={editingBase}
        title="Editar base de conhecimento"
        description="Atualize os metadados desta base."
        submitLabel="Salvar base"
        pendingLabel="Salvando..."
        onClose={handleCloseEditBaseModal}
        onSubmit={handleUpdateBase}
      />
      <EditDocumentModal
        document={editingDocument}
        isPending={updateDocumentMutation.isPending}
        error={updateDocumentMutation.error}
        onClose={handleCloseEditDocumentModal}
        onSubmit={handleUpdateDocument}
      />
      <DeleteConfirmationModal
        target={deleteTarget}
        isPending={deleteBaseMutation.isPending || deleteDocumentMutation.isPending}
        error={
          deleteTarget?.type === "base"
            ? deleteBaseMutation.error
            : deleteDocumentMutation.error
        }
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
