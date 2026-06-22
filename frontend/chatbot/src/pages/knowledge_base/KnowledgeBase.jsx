import { FaDatabase, FaExclamationTriangle, FaFilePdf, FaSpinner } from "react-icons/fa";
import { useKnowledgeBaseDocuments } from "../../hooks/useKnowledgeBaseDocuments";

const statusStyles = {
  ENVIANDO: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  PROCESSANDO: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  CONCLUIDO: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  ERRO: "border-red-500/30 bg-red-500/10 text-red-300",
};

const documentTypeLabels = {
  PORTARIA: "Portaria",
  RESOLUCAO: "Resolucao",
  ROD: "ROD",
};

function formatDate(value) {
  if (!value) {
    return "Data indisponivel";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponivel";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusClass(status) {
  return statusStyles[status] ?? "border-gray-700 bg-gray-800 text-gray-300";
}

export function KnowledgeBase() {
  const { data: documents = [], isError, isLoading } = useKnowledgeBaseDocuments();

  return (
    <div className="h-screen overflow-y-auto bg-gray-950 px-6 py-8 md:px-10" data-cy="knowledge-base-page">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Base de Conhecimento</h1>
          <p className="mt-2 text-sm text-gray-400">
            Documentos persistidos e disponiveis para consulta historica.
          </p>
        </header>

        <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Documentos armazenados</h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-400">
                Lista geral dos arquivos cadastrados no backend.
              </p>
            </div>

            <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-300" data-cy="knowledge-documents-count">
              {documents.length} {documents.length === 1 ? "documento" : "documentos"}
            </div>
          </div>

          {isLoading && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950/60 px-4 py-10 text-sm text-gray-400" data-cy="knowledge-loading">
              <FaSpinner className="animate-spin text-sky-400" />
              Carregando documentos...
            </div>
          )}

          {isError && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-10 text-sm text-red-200" data-cy="knowledge-error">
              <FaExclamationTriangle className="shrink-0" />
              Nao foi possivel carregar os documentos.
            </div>
          )}

          {!isLoading && !isError && documents.length === 0 && (
            <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-gray-800 bg-gray-950/60 px-4 py-12 text-center text-sm text-gray-500" data-cy="knowledge-empty-state">
              <FaDatabase className="mb-3 text-2xl text-gray-600" />
              Nenhum documento persistido foi encontrado.
            </div>
          )}

          {!isLoading && !isError && documents.length > 0 && (
            <ul className="mt-6 space-y-3">
              {documents.map((document) => (
                <li
                  key={document.id}
                  data-cy="knowledge-document"
                  className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                      <FaFilePdf className="text-lg" />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {document.nome_documento || "Documento sem nome"}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {documentTypeLabels[document.tipo] ?? document.tipo ?? "Tipo nao informado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-end">
                    <span className="text-gray-400">
                      {formatDate(document.data_atualizacao)}
                    </span>

                    <span
                      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
                        document.status
                      )}`}
                    >
                      {document.status || "SEM STATUS"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
