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
} from "react-icons/fa";
import * as Switch from "@radix-ui/react-switch";
import {
  useKnowledgeBases,
  useKnowledgeBaseDocuments,
  useActivateBase,
  useDeactivateBase,
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
    <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-sm transition-all duration-300 hover:border-gray-700 hover:shadow-md">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent}`}
      >
        <IconComponent className="text-lg" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="mt-0.5 truncate text-lg font-semibold text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Document Row ─────────────────────────────────────────────────────────────

function DocumentRow({ doc }) {
  return (
    <div className="group flex flex-wrap items-center gap-3 rounded-lg border border-transparent px-3 py-3 transition-all duration-200 hover:border-gray-800 hover:bg-gray-800/50 xs:px-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
        <FaFileAlt className="text-sm" />
      </div>

      <div className="min-w-[10rem] flex-1">
        <p className="truncate text-sm font-medium text-gray-200 group-hover:text-white">
          {doc.nome_documento || "Documento sem título"}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {doc.tipo || "Geral"}
        </p>
      </div>

      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
        doc.status === "CONCLUIDO" ? "bg-emerald-500/15 text-emerald-400" :
        doc.status === "PROCESSANDO" ? "bg-amber-500/15 text-amber-400" :
        doc.status === "ERRO" ? "bg-red-500/15 text-red-400" :
        "bg-sky-500/15 text-sky-400"
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
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-xs text-gray-500">
          ?
        </div>
      </div>
      <div>
        <p className="text-lg font-medium text-gray-400">
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
      role="button"
      tabIndex={0}
      onClick={() => onSelect(base)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(base); }}
      className={`group flex w-full cursor-pointer gap-3 rounded-xl border px-3 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 xs:px-4 ${
        isSelected
          ? "border-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/5"
          : "border-transparent hover:border-gray-800 hover:bg-gray-800/50"
      }`}
      style={isSelected ? { borderLeftWidth: "3px" } : {}}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
          isSelected
            ? "bg-blue-500/20 text-blue-400"
            : "bg-gray-800 text-gray-400 group-hover:text-gray-300"
        }`}
      >
        <FaDatabase className="text-sm" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold ${
            isSelected ? "text-white" : "text-gray-200 group-hover:text-white"
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

      {/* Toggle */}
      <div
        className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <Switch.Root
          checked={isActive}
          disabled={isToggling}
          onCheckedChange={() => onToggle(base)}
          className={`relative h-[22px] w-[40px] cursor-pointer rounded-full outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
            isActive ? "bg-emerald-500" : "bg-gray-700"
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
            isActive ? "text-emerald-400" : "text-gray-600"
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
    <div className="flex h-full flex-col overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-700">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-800 p-4 md:p-6">
        <div className="flex flex-col gap-4 xs:flex-row xs:items-start xs:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <FaFolderOpen className="shrink-0 text-2xl text-sky-400" />
              <h2 className="truncate text-lg font-bold text-white xs:text-xl">
                {base.titulo || "Base sem nome"}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              {base.descricao || "Sem descrição disponível."}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              isActive
                ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                : "bg-gray-800 text-gray-500 ring-1 ring-gray-700"
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
          accent="bg-sky-500/15 text-sky-400"
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
          accent={isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-gray-700/30 text-gray-400"}
        />
      </div>

      {/* Documents */}
      <div className="min-h-0 flex-1 px-4 pb-4 md:px-6 md:pb-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          <FaFileAlt className="text-xs" />
          Documentos Recentes
        </h3>

        {loadingDocs && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-gray-800/60"
              />
            ))}
          </div>
        )}

        {!loadingDocs && (!documents || documents.length === 0) && (
          <div className="rounded-xl border border-dashed border-gray-800 py-10 text-center">
            <FaFileAlt className="mx-auto text-3xl text-gray-700" />
            <p className="mt-3 text-sm text-gray-500">
              Nenhum documento encontrado nesta base
            </p>
          </div>
        )}

        {!loadingDocs && documents && documents.length > 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 divide-y divide-gray-800/60">
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

  const [selectedBaseId, setSelectedBaseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="flex h-full min-h-0 bg-gray-950">
      {/* ── Left Column: List ──────────────────────────────── */}
      <div className="flex w-full min-w-0 flex-col border-r border-gray-800 md:w-[40%] md:min-w-[340px] md:max-w-[500px]">
        {/* Header */}
        <div className="shrink-0 border-b border-gray-800 p-4 xs:p-5">
          <h1 className="text-lg font-bold text-white xs:text-xl">
            Bases de Conhecimento
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Gerencie as bases de dados de conhecimento do chatbot
          </p>

          {/* Search */}
          <div className="relative mt-4">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-9 pr-4 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors hover:border-gray-700 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-700">
          {isLoading && (
            <div className="flex flex-col gap-2 px-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-gray-900/60"
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="mx-1 rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-center text-sm text-red-300">
              Erro ao carregar as bases de conhecimento.
            </div>
          )}

          {!isLoading && !isError && filteredBases.length === 0 && (
            <div className="mx-1 rounded-xl border border-dashed border-gray-800 py-10 text-center">
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
                  <div className="my-2 overflow-hidden rounded-xl border border-gray-800 bg-gray-950/40 md:hidden">
                    <DetailPanel base={base} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-800 px-5 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Total:{" "}
              <span className="font-semibold text-gray-300">{totalBases}</span>{" "}
              bases
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-emerald-400">
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
    </div>
  );
}
