import { UploadArea } from "../../components/file_upload/UploadArea";

export function FileUpload() {
  return (
    <div className="h-screen overflow-y-auto bg-gray-950 px-6 py-8 md:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Inserir documentos</h1>
          <p className="mt-2 text-sm text-gray-400">
            Prepare arquivos PDF em memoria antes de envia-los para a base.
          </p>
        </header>

        <UploadArea />
      </div>
    </div>
  );
}
