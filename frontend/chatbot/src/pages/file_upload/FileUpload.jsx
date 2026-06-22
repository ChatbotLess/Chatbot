import { UploadArea } from "../../components/file_upload/UploadArea";

export function FileUpload() {
  return (
    <div className="h-full overflow-y-auto bg-gray-950 px-4 py-6 xs:px-5 md:px-10 md:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl font-bold text-white md:text-3xl">Enviar documento</h1>
          <p className="mt-2 text-sm text-gray-400">
            Selecione a base, o tipo e faça o envio de um arquivo PDF.
          </p>
        </header>

        <UploadArea />
      </div>
    </div>
  );
}
