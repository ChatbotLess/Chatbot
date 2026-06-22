import { useRef, useState } from "react";
import { FaFilePdf, FaTrashAlt, FaUpload, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { useKnowledgeBases } from "../../hooks/useKnowledgeBase";
import { useUploadDocument } from "../../hooks/useUploadDocument";

const TIPOS_DOCUMENTO = [
  { value: "PORTARIA", label: "Portaria" },
  { value: "RESOLUCAO", label: "Resolução" },
  { value: "ROD", label: "Rod" },
];

export function UploadArea() {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBaseId, setSelectedBaseId] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");

  const {
    data: bases = [],
    isError: isErrorBases,
    isLoading: isLoadingBases,
  } = useKnowledgeBases();
  const uploadMutation = useUploadDocument();

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      uploadMutation.reset();
    }
    event.target.value = "";
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    uploadMutation.reset();
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedBaseId || !selectedTipo) return;

    uploadMutation.mutate(
      { file: selectedFile, baseId: selectedBaseId, tipo: selectedTipo },
      {
        onSuccess: () => {
          setSelectedFile(null);
        },
      }
    );
  };

  const formatFileSize = (sizeInBytes) => {
    const sizeInMb = sizeInBytes / (1024 * 1024);
    if (sizeInMb < 0.01) {
      const sizeInKb = sizeInBytes / 1024;
      return `${sizeInKb.toFixed(1)} KB`;
    }
    return `${sizeInMb.toFixed(2)} MB`;
  };

  const isFormReady = selectedFile && selectedBaseId && selectedTipo;
  const isBaseSelectDisabled = isLoadingBases || isErrorBases || bases.length === 0;

  return (
    <div className="space-y-6" data-cy="upload-area">
      <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm xs:p-5 md:p-6">
        <h2 className="text-lg font-semibold text-white xs:text-xl">Configurações do envio</h2>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          Selecione a base de conhecimento e o tipo de documento antes de enviar o arquivo.
        </p>

        <div className="mt-5 grid gap-5 md:mt-6 md:grid-cols-2">
          <div>
            <label htmlFor="base-select" className="mb-2 block text-sm font-medium text-gray-300">
              Base de conhecimento
            </label>
            <select
              id="base-select"
              value={selectedBaseId}
              onChange={(e) => setSelectedBaseId(e.target.value)}
              disabled={isBaseSelectDisabled}
              data-cy="base-select"
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white transition focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
            >
              <option value="">
                {isLoadingBases
                  ? "Carregando bases..."
                  : isErrorBases
                    ? "Erro ao carregar bases"
                    : bases.length === 0
                      ? "Nenhuma base disponivel"
                      : "Selecione uma base"}
              </option>
              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.titulo} - v{base.versao}
                  {base.status === "ATIVO" ? " (Ativa)" : ""}
                </option>
              ))}
            </select>
            {!isLoadingBases && !isErrorBases && bases.length === 0 && (
              <p className="mt-2 text-xs text-amber-300/80">
                Cadastre uma base de conhecimento antes de enviar documentos.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tipo-select" className="mb-2 block text-sm font-medium text-gray-300">
              Tipo de documento
            </label>
            <select
              id="tipo-select"
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              data-cy="document-type-select"
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white transition focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Selecione o tipo</option>
              {TIPOS_DOCUMENTO.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm xs:p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white xs:text-xl">Inserir documento</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Adicione um arquivo PDF para compor a base de conhecimento utilizada pelo chatbot.
            </p>
          </div>

          <div
            className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-300"
            data-cy="selected-documents-count"
          >
            {selectedFile ? "1 documento selecionado" : "0 documentos selecionados"}
          </div>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!!selectedFile}
          data-cy="file-select-button"
          className={`mt-6 flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 xs:px-6 md:py-12 ${
            selectedFile
              ? "cursor-not-allowed border-gray-800 bg-gray-950/40 opacity-50"
              : "border-gray-700 bg-gray-950/80 hover:border-sky-500/50 hover:bg-gray-950"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
            <FaUpload className="text-xl" />
          </span>
          <span className="mt-5 text-base font-medium text-white xs:text-lg">
            {selectedFile ? "Arquivo já selecionado" : "Clique para selecionar um arquivo PDF"}
          </span>
          <span className="mt-2 text-sm text-gray-400">
            {selectedFile
              ? "Remova o arquivo atual para selecionar outro."
              : "Somente um arquivo PDF por envio."}
          </span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelected}
          data-cy="file-input"
          className="hidden"
        />
      </section>

      {selectedFile ? (
        <section className="rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm xs:p-5 md:p-6">
          <h3 className="text-lg font-semibold text-white">Documento selecionado</h3>
          <p className="mt-1 text-sm text-gray-400">
            Confira o arquivo antes de enviá-lo.
          </p>

          <div
            className="mt-5 flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-4 md:flex-row md:items-center md:justify-between"
            data-cy="selected-document"
          >
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                <FaFilePdf className="text-lg" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{selectedFile.name}</p>
                <p className="mt-1 text-sm text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={uploadMutation.isPending}
              data-cy="remove-document"
              className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 disabled:cursor-not-allowed disabled:opacity-50 md:self-auto"
            >
              <FaTrashAlt />
              Remover
            </button>
          </div>
        </section>
      ) : (
        <div
          className="rounded-xl border border-dashed border-gray-800 bg-gray-950/60 px-4 py-10 text-center text-sm text-gray-500"
          data-cy="upload-empty-state"
        >
          Nenhum documento PDF foi inserido ainda.
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!isFormReady || uploadMutation.isPending}
          data-cy="upload-submit"
          className={`inline-flex w-full items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 sm:w-auto sm:px-8 ${
            isFormReady && !uploadMutation.isPending
              ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500"
              : "cursor-not-allowed bg-gray-800 text-gray-500"
          }`}
        >
          {uploadMutation.isPending ? (
            <>
              <FaSpinner className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <FaCloudUploadAlt className="text-lg" />
              Enviar documento
            </>
          )}
        </button>

        {uploadMutation.isSuccess && (
          <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400" data-cy="upload-success">
            <FaCheckCircle />
            Documento enviado com sucesso!
          </span>
        )}

        {uploadMutation.isError && (
          <span className="inline-flex items-start gap-2 text-sm font-medium text-rose-400" data-cy="upload-error">
            <FaExclamationTriangle />
            Erro ao enviar: {uploadMutation.error?.response?.data?.erro || uploadMutation.error?.message}
          </span>
        )}
      </div>

      {!isFormReady && (selectedFile || selectedBaseId || selectedTipo) && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300/80">
          <p className="font-medium text-amber-300">Para enviar, preencha todos os campos:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {!selectedBaseId && <li>Selecione uma base de conhecimento</li>}
            {!selectedTipo && <li>Selecione o tipo de documento</li>}
            {!selectedFile && <li>Selecione um arquivo PDF</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
