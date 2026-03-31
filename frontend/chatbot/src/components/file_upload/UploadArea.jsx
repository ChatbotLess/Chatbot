import { useRef, useState } from "react";
import { FaFilePdf, FaTrashAlt, FaUpload } from "react-icons/fa";

export function UploadArea() {
  const inputRef = useRef(null);
  const [documents, setDocuments] = useState([]);

  const handleFilesSelected = (event) => {
    const selectedFiles = Array.from(event.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );

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

  const formatFileSize = (sizeInBytes) => {
    const sizeInMb = sizeInBytes / (1024 * 1024);
    return `${sizeInMb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Inserir documentos</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Adicione arquivos PDF para compor a base de conhecimento utilizada pelo
              chatbot.
            </p>
          </div>

          <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-300">
            {documents.length} {documents.length === 1 ? "documento" : "documentos"} selecionados
          </div>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
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
          className="hidden"
        />
      </section>

      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Documentos inseridos</h3>
            <p className="mt-1 text-sm text-gray-400">
              Gerencie os arquivos carregados nesta sess&atilde;o.
            </p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-800 bg-gray-950/60 px-4 py-10 text-center text-sm text-gray-500">
            Nenhum documento PDF foi inserido ainda.
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {documents.map((document) => (
              <li
                key={document.id}
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

                <button
                  type="button"
                  onClick={() => handleRemoveDocument(document.id)}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 md:self-auto"
                >
                  <FaTrashAlt />
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
