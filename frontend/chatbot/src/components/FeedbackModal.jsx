import { memo } from "react";
import { TbX } from "react-icons/tb";

export const FeedbackModal = memo(function FeedbackModal({
  errorMessage,
  feedbackText,
  isPending,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">Enviar feedback</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fechar modal de feedback"
          >
            <TbX size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <textarea
            value={feedbackText}
            onChange={(event) => onChange(event.target.value)}
            rows={5}
            autoFocus
            placeholder="Descreva o que nao ficou bom nessa resposta..."
            disabled={isPending}
            className="w-full resize-none rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm leading-6 text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
          />

          {errorMessage && (
            <p className="text-sm text-red-300">{errorMessage}</p>
          )}

          <div className="flex flex-col-reverse gap-2 xs:flex-row xs:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-950 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Enviando..." : "Enviar feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
