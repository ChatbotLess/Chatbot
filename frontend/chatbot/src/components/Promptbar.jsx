import { TbSend } from "react-icons/tb";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMessageMutate } from "../hooks/useMessageMutate";
import { useStream } from "../context/StreamContext/StreamProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useBackendUser } from "../hooks/useKnowledgeBaseDocuments";

export function Promptbar() {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { mutate, isPending } = useMessageMutate();
  const { startStream, clearStream, isStreaming } = useStream();
  const queryClient = useQueryClient();
  const {
    data: backendUser,
    isError: isBackendUserError,
    isLoading: isBackendUserLoading,
  } = useBackendUser();

  const handlePerguntar = (data) => {
    const message = data.message?.trim();
    if (!message || isStreaming || !backendUser?.id) return;

    clearStream();

    mutate(
      {
        userid: backendUser.id,
        message,
        chatID: conversationId ?? null,
      },
      {
        onSuccess: async ({ chatId, stream }) => {
          if (!conversationId && chatId) {
            navigate(`/chat/${chatId}`);
          }

          await startStream(stream, message);

          await queryClient.refetchQueries({
            queryKey: ["chat-messages", backendUser.id, chatId ?? conversationId],
          });

          clearStream();

          queryClient.invalidateQueries({
            queryKey: ["chat-data", backendUser.id],
          });
        },
      }
    );

    reset();
  };

  const busy = isPending || isStreaming || isBackendUserLoading || isBackendUserError;

  return (
    <form className="w-full" onSubmit={handleSubmit(handlePerguntar)} data-cy="prompt-form">
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 gap-2">
        <input
          type="text"
          data-cy="prompt-input"
          placeholder={
            isBackendUserError
              ? "Nao foi possivel carregar o usuario"
              : "Ola, como posso te ajudar?"
          }
          className="flex bg-transparent outline-none text-gray-200 placeholder-gray-400 w-[100%] disabled:opacity-50"
          disabled={busy}
          {...register("message", { required: true })}
        />
        <button
          type="submit"
          disabled={busy}
          data-cy="prompt-submit"
          className="p-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-40"
        >
          <TbSend size={20} className="text-gray-300" />
        </button>
      </div>
    </form>
  );
}
