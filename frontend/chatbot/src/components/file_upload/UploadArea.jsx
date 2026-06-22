import { useRef, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaFilePdf,
  FaSpinner,
  FaTrashAlt,
  FaUpload,
} from "react-icons/fa";
import {
  useBackendUser,
  useKnowledgeBases,
  useUploadDocuments,
} from "../../hooks/useKnowledgeBaseDocuments";

const DOCUMENT_TYPES = [
  { value: "PORTARIA", label: "Portaria" },
  { value: "RESOLUCAO", label: "Resolucao" },
  { value: "ROD", label: "ROD" },
];

function getErrorMessage(error) {
  const backendMessage = error?.response?.data?.detail ?? error?.response?.data?.erro;

  if (Array.isArray(backendMessage)) {
    return backendMessage.join(", ");
  }

  if (typeof backendMessage === "string") {
    return backendMessage;
  }

  if (backendMessage && typeof backendMessage === "object") {
    return Object.values(backendMessage).flat().join(", ");
  }

  return error?.message || "Nao foi possivel enviar os documentos.";
}

export function UploadArea() {
  const inputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isPreparingUpload, setIsPreparingUpload] = useState(false);
  const backendUserQuery = useBackendUser(false);
  const knowledgeBasesQuery = useKnowledgeBases(false);
  const uploadDocumentsMutation = useUploadDocuments();

  const handleFilesSelected = (event) => {
    const selectedFiles = Array.from(event.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );

    setSuccessMessage("");
    setSubmitError("");
    setDocuments((currentDocuments) => {
      const existingKeys = new Set(
        currentDocuments.map((document) => `${document.name}-${document.size}`)
      );

      const newDocuments = selectedFiles
        .filter((file) => !existingKeys.has(`${file.name}-${file.size}`))
        .map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          name: file.name,
          size: file.size,
          tipo: DOCUMENT_TYPES[0].value,
          file,
        }));

      return [...currentDocuments, ...newDocuments];
    });

    event.target.value = "";
  };

  const handleRemoveDocument = (documentId) => {
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== documentId)
    );
  };

  const handleDocumentTypeChange = (documentId, tipo) => {
    setDocuments((currentDocuments) =>
      currentDocuments.map((document) =>
        document.id === documentId ? { ...document, tipo } : document
      )
    );
  };

  const handleSubmitDocuments = async () => {
    if (documents.length === 0) {
      return;
    }

    setSuccessMessage("");
    setSubmitError("");
    setIsPreparingUpload(true);

    try {
      const [backendUserResult, knowledgeBasesResult] = await Promise.all([
        backendUserQuery.refetch(),
        knowledgeBasesQuery.refetch(),
      ]);

      if (backendUserResult.isError) {
        throw new Error("Nao foi possivel carregar o usuario do backend.");
      }

      if (knowledgeBasesResult.isError) {
        throw new Error("Nao foi possivel carregar a base para envio.");
      }

      const backendUser = backendUserResult.data;
      const base = knowledgeBasesResult.data?.[0];

      if (!backendUser?.id) {
        throw new Error("Usuario autenticado nao encontrado no backend.");
      }

      if (!base?.id) {
        throw new Error("Nenhuma base cadastrada para receber os documentos.");
      }

      await uploadDocumentsMutation.mutateAsync({
        baseId: base.id,
        userId: backendUser.id,
        documents,
      });
      setDocuments([]);
      setSuccessMessage("Documentos enviados com sucesso.");
    } catch (error) {
      console.error(error);
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsPreparingUpload(false);
    }
  };

  const formatFileSize = (sizeInBytes) => {
    const sizeInMb = sizeInBytes / (1024 * 1024);
    return `${sizeInMb.toFixed(2)} MB`;
  };

  const canSubmit =
    documents.length > 0 && !isPreparingUpload && !uploadDocumentsMutation.isPending;

  return (
    <div className="space-y-6" data-cy="upload-area">
      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Inserir documentos</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Adicione arquivos PDF para compor a base de conhecimento utilizada pelo
              chatbot.
            </p>
          </div>

          <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-300" data-cy="selected-documents-count">
            {documents.length} {documents.length === 1 ? "documento" : "documentos"} selecionados
          </div>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadDocumentsMutation.isPending}
          data-cy="file-select-button"
          className="mt-6 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-950/80 px-6 py-12 text-center transition hover:border-sky-500/50 hover:bg-gray-950"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
            <FaUpload className="text-xl" />
          </span>
          <span className="mt-5 text-lg font-medium text-white">
            Clique para selecionar arquivos PDF
          </span>
          <span className="mt-2 text-sm text-gray-400">
            Voc&ecirc; pode adicionar m&uacute;ltiplos documentos e remov&ecirc;-los da lista abaixo.
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFilesSelected}
          data-cy="file-input"
          className="hidden"
        />
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Documentos inseridos</h3>
            <p className="mt-1 text-sm text-gray-400">
              Gerencie os arquivos carregados nesta sess&atilde;o.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmitDocuments}
            disabled={!canSubmit}
            data-cy="upload-submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          >
            {isPreparingUpload || uploadDocumentsMutation.isPending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaUpload />
            )}
            {isPreparingUpload || uploadDocumentsMutation.isPending
              ? "Enviando..."
              : "Enviar documentos"}
          </button>
        </div>

        {submitError && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200" data-cy="upload-error">
            <FaExclamationTriangle className="shrink-0" />
            {submitError}
          </div>
        )}

        {uploadDocumentsMutation.isError && !submitError && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200" data-cy="upload-error">
            <FaExclamationTriangle className="shrink-0" />
            Nao foi possivel enviar os documentos.
          </div>
        )}

        {successMessage && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200" data-cy="upload-success">
            <FaCheckCircle className="shrink-0" />
            {successMessage}
          </div>
        )}

        {documents.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-800 bg-gray-950/60 px-4 py-10 text-center text-sm text-gray-500" data-cy="upload-empty-state">
            Nenhum documento PDF foi inserido ainda.
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {documents.map((document) => (
              <li
                key={document.id}
                data-cy="selected-document"
                className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                    <FaFilePdf className="text-lg" />
                  </span>

                  <div>
                    <p className="font-medium text-white">{document.name}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {formatFileSize(document.size)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <label className="flex flex-col gap-1 text-sm text-gray-400">
                    Tipo
                    <select
                      value={document.tipo}
                      onChange={(event) =>
                        handleDocumentTypeChange(document.id, event.target.value)
                      }
                      disabled={isPreparingUpload || uploadDocumentsMutation.isPending}
                      data-cy="document-type-select"
                      className="min-w-36 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-200 outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(document.id)}
                    disabled={isPreparingUpload || uploadDocumentsMutation.isPending}
                    data-cy="remove-document"
                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60 md:self-end"
                  >
                    <FaTrashAlt />
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
