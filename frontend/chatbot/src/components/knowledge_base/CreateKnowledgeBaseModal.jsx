import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaDatabase, FaTimes } from "react-icons/fa";

function getErrorMessage(error) {
  const responseData = error?.response?.data;

  if (Array.isArray(responseData?.erro)) {
    return responseData.erro.join(" ");
  }

  if (typeof responseData?.erro === "string") {
    return responseData.erro;
  }

  if (Array.isArray(responseData?.detail)) {
    return responseData.detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" ");
  }

  return error?.message || "Não foi possível criar a base de conhecimento.";
}

export function CreateKnowledgeBaseModal({
  isOpen,
  isPending,
  error,
  onClose,
  onSubmit,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      titulo: "",
      versao: "",
      descricao: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const inputClassName =
    "w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-600 focus:border-ifes-green-500 focus:ring-2 focus:ring-ifes-green-500/20 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-knowledge-base-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-xl border border-gray-300 bg-white p-5 shadow-2xl xs:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ifes-green-500/15 text-ifes-green-700">
              <FaDatabase />
            </div>
            <div>
              <h2
                id="create-knowledge-base-title"
                className="text-lg font-semibold text-gray-950"
              >
                Nova base de conhecimento
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                A nova base será definida como ativa.
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

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="knowledge-base-title"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Título
            </label>
            <input
              id="knowledge-base-title"
              type="text"
              autoFocus
              disabled={isPending}
              placeholder="Ex.: Normas institucionais"
              className={inputClassName}
              {...register("titulo", {
                required: "Informe o título.",
                validate: (value) =>
                  value.trim().length > 0 || "Informe o título.",
              })}
            />
            {errors.titulo && (
              <p className="mt-1 text-xs text-ifes-red-700">
                {errors.titulo.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="knowledge-base-version"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Versão
            </label>
            <input
              id="knowledge-base-version"
              type="text"
              disabled={isPending}
              placeholder="Ex.: 1.0"
              className={inputClassName}
              {...register("versao", {
                required: "Informe a versão.",
                validate: (value) =>
                  value.trim().length > 0 || "Informe a versão.",
              })}
            />
            {errors.versao && (
              <p className="mt-1 text-xs text-ifes-red-700">
                {errors.versao.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="knowledge-base-description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Descrição
            </label>
            <textarea
              id="knowledge-base-description"
              rows={4}
              disabled={isPending}
              placeholder="Descreva o conteúdo e a finalidade desta base"
              className={`${inputClassName} resize-none`}
              {...register("descricao", {
                required: "Informe a descrição.",
                validate: (value) =>
                  value.trim().length > 0 || "Informe a descrição.",
              })}
            />
            {errors.descricao && (
              <p className="mt-1 text-xs text-ifes-red-700">
                {errors.descricao.message}
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-ifes-red-200 bg-ifes-red-50 px-3 py-2 text-sm text-ifes-red-700"
            >
              {getErrorMessage(error)}
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
              disabled={isPending}
              className="rounded-lg bg-ifes-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ifes-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Criando..." : "Criar base"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
