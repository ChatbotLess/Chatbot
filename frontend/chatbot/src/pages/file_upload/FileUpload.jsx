import { UploadArea } from "../../components/file_upload/UploadArea";

export function FileUpload() {
  return (
    <div className="h-screen overflow-y-auto bg-gray-950 px-6 py-8 md:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Enviar documento</h1>
          <p className="mt-2 text-sm text-gray-400">
            Selecione a base, o tipo e faça o envio de um arquivo PDF.
          </p>
        </header>

        <UploadArea />
      </div>
    </div>
  );
}
