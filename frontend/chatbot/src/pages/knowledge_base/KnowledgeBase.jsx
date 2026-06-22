import { Fragment, useState, useMemo } from "react";
import {
  FaSearch,
  FaDatabase,
  FaFileAlt,
  FaFolder,
  FaFolderOpen,
  FaCalendarAlt,
  FaClock,
  FaLayerGroup,
  FaPlus,
} from "react-icons/fa";
import * as Switch from "@radix-ui/react-switch";
import { CreateKnowledgeBaseModal } from "../../components/knowledge_base/CreateKnowledgeBaseModal";
import {
  useKnowledgeBases,
  useKnowledgeBaseDocuments,
  useActivateBase,
  useDeactivateBase,
  useCreateBase,
} from "../../hooks/useKnowledgeBase";

// ── Helper ───────────────────────────────────────────────────────────────────

function formatDate(raw) {
  if (!raw) return "—";
  const d = new Date(raw);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accent }) {
  const IconComponent = icon;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-md">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent}`}
      >
        <IconComponent className="text-lg" />
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

// ── Document Row ─────────────────────────────────────────────────────────────

function DocumentRow({ doc }) {
  return (
    <div className="group flex flex-wrap items-center gap-3 rounded-lg border border-transparent px-3 py-3 transition-all duration-200 hover:border-gray-200 hover:bg-gray-100 xs:px-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ifes-green-500/10 text-ifes-green-700">
        <FaFileAlt className="text-sm" />
      </div>

      <div className="min-w-[10rem] flex-1">
        <p className="truncate text-sm font-medium text-gray-800 group-hover:text-gray-950">
          {doc.nome_documento || "Documento sem título"}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {doc.tipo || "Geral"}
        </p>
      </div>

      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
        doc.status === "CONCLUIDO" ? "bg-ifes-green-500/15 text-ifes-green-700" :
        doc.status === "PROCESSANDO" ? "bg-amber-500/15 text-amber-400" :
        doc.status === "ERRO" ? "bg-ifes-red-500/15 text-ifes-red-700" :
        "bg-ifes-green-500/15 text-ifes-green-700"
      }`}>
        {doc.status || "—"}
      </span>

      <span className="shrink-0 text-xs text-gray-500">
        {formatDate(doc.data_atualizacao)}
      </span>
    </div>
  );
}

// ── Empty Detail State ───────────────────────────────────────────────────────

function EmptyDetail() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-gray-500">
      <div className="relative">
        <FaFolder className="text-6xl text-gray-700 opacity-60" />
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500">
          ?
        </div>
      </div>
      <div>
        <p className="text-lg font-medium text-gray-600">
          Selecione uma base de conhecimento
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Clique em uma base à esquerda para ver seus detalhes e documentos
        </p>
      </div>
    </div>
  );
}

// ── Base List Item ───────────────────────────────────────────────────────────

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
      >
        {/* Icon */}
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isSelected
              ? "bg-ifes-green-500/20 text-ifes-green-700"
              : "bg-gray-100 text-gray-600 group-hover:text-gray-700"
          }`}
        >
          <FaDatabase className="text-sm" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold ${
              isSelected ? "text-gray-950" : "text-gray-800 group-hover:text-gray-950"
            }`}
          >
            {base.titulo || "Base sem nome"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {base.descricao || "Sem descrição"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600">
            <span className="flex items-center gap-1">
              <FaFileAlt className="text-[10px]" />
              {base.versao || "—"}
            </span>
            <span className="flex items-center gap-1">
              <FaClock className="text-[10px]" />
              {formatDate(base.data_criacao)}
            </span>
          </div>
        </div>
      </button>

      {/* Toggle */}
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

// ── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({ base }) {
  const isActive = base.status === "ATIVO";
  const { data: documents, isLoading: loadingDocs } =
    useKnowledgeBaseDocuments(base.id, true);

  return (
    <div className="flex h-full flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-200">
      {/* Header */}
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
              {base.descricao || "Sem descrição disponível."}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              isActive
                ? "bg-ifes-green-500/15 text-ifes-green-700 ring-1 ring-ifes-green-500/30"
                : "bg-gray-100 text-gray-500 ring-1 ring-gray-300"
            }`}
          >
            {isActive ? "● Ativa" : "● Inativa"}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="shrink-0 grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 md:p-6">
        <StatCard
          icon={FaLayerGroup}
          label="Versão"
          value={base.versao || "—"}
          accent="bg-ifes-green-500/15 text-ifes-green-700"
        />
        <StatCard
          icon={FaCalendarAlt}
          label="Criação"
          value={formatDate(base.data_criacao)}
          accent="bg-violet-500/15 text-violet-400"
        />
        <StatCard
          icon={FaClock}
          label="Status"
          value={isActive ? "Ativa" : "Inativa"}
          accent={isActive ? "bg-ifes-green-500/15 text-ifes-green-700" : "bg-gray-200 text-gray-600"}
        />
      </div>

      {/* Documents */}
      <div className="min-h-0 flex-1 px-4 pb-4 md:px-6 md:pb-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
          <FaFileAlt className="text-xs" />
          Documentos Recentes
        </h3>

        {loadingDocs && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        )}

        {!loadingDocs && (!documents || documents.length === 0) && (
          <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
            <FaFileAlt className="mx-auto text-3xl text-gray-700" />
            <p className="mt-3 text-sm text-gray-500">
              Nenhum documento encontrado nesta base
            </p>
          </div>
        )}

        {!loadingDocs && documents && documents.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-200">
            {documents.map((doc, index) => (
              <DocumentRow key={doc.id ?? index} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function KnowledgeBase() {
  const { data: bases, isLoading, isError } = useKnowledgeBases();
  const activateMutation = useActivateBase();
  const deactivateMutation = useDeactivateBase();
  const createMutation = useCreateBase();

  const [selectedBaseId, setSelectedBaseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const sortedBases = useMemo(() => {
    if (!bases) return [];
    return [...bases].sort((a, b) => a.id - b.id);
  }, [bases]);

  const filteredBases = useMemo(() => {
    if (!searchQuery.trim()) return sortedBases;

    const q = searchQuery.toLowerCase();
    return sortedBases.filter(
      (b) =>
        (b.titulo || "").toLowerCase().includes(q) ||
        (b.descricao || "").toLowerCase().includes(q)
    );
  }, [sortedBases, searchQuery]);

  const selectedBase = useMemo(
    () => sortedBases.find((b) => b.id === selectedBaseId) ?? null,
    [sortedBases, selectedBaseId]
  );

  const totalBases = bases?.length ?? 0;
  const activeBases = bases?.filter((b) => b.status === "ATIVO").length ?? 0;

  const handleToggle = async (base) => {
    const isActive = base.status === "ATIVO";

    try {
      if (isActive) {
        await deactivateMutation.mutateAsync(base.id);
      } else {
        await activateMutation.mutateAsync(base.id);
      }
    } catch (error) {
      console.error("Erro ao alterar status da base:", error);
    }
  };

  const isToggling =
    activateMutation.isPending || deactivateMutation.isPending;

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

  const handleCloseCreateModal = () => {
    if (createMutation.isPending) return;
    createMutation.reset();
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex h-full min-h-0 bg-gray-50">
      {/* ── Left Column: List ──────────────────────────────── */}
      <div className="flex w-full min-w-0 flex-col border-r border-gray-200 md:w-[40%] md:min-w-[340px] md:max-w-[500px]">
        {/* Header */}
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

          {/* Search */}
          <div className="relative mt-4">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition-colors hover:border-gray-300 focus:border-ifes-green-500/50 focus:ring-1 focus:ring-ifes-green-500/20"
            />
          </div>
        </div>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-200">
          {isLoading && (
            <div className="flex flex-col gap-2 px-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="mx-1 rounded-xl border border-ifes-red-200 bg-ifes-red-50 p-4 text-center text-sm text-ifes-red-700">
              Erro ao carregar as bases de conhecimento.
            </div>
          )}

          {!isLoading && !isError && filteredBases.length === 0 && (
            <div className="mx-1 rounded-xl border border-dashed border-gray-200 py-10 text-center">
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
                  onSelect={(b) => setSelectedBaseId(b.id)}
                  onToggle={handleToggle}
                  isToggling={isToggling}
                />
                {selectedBaseId === base.id && (
                  <div className="my-2 overflow-hidden rounded-xl border border-gray-200 bg-white md:hidden">
                    <DetailPanel base={base} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Footer */}
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

      {/* ── Right Column: Detail ───────────────────────────── */}
      <div className="hidden flex-1 md:block">
        {selectedBase ? (
          <DetailPanel base={selectedBase} />
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
    </div>
  );
}
