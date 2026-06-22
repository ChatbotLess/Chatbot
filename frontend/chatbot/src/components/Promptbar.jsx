import { useContext } from "react";
import { TbSend } from "react-icons/tb";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMessageMutate } from "../hooks/useMessageMutate";
import { useStream } from "../context/StreamContext/StreamProvider";
import { useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys, getChatQueryScope } from "../hooks/useChatData";
import { AuthContext } from "../context/AuthProvider/AuthProvider";

export function Promptbar() {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { mutate, isPending } = useMessageMutate();
  const { startStream, clearStream, isStreaming } = useStream();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const chatScope = getChatQueryScope(user);

  const handlePerguntar = (data) => {
    const message = data.message?.trim();
    if (!message || isStreaming || !user?.uid) return;

    clearStream();

    mutate(
      {
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
            queryKey: chatQueryKeys.messages(chatScope, chatId ?? conversationId),
          });

          clearStream();

          queryClient.invalidateQueries({
            queryKey: chatQueryKeys.chats(chatScope),
          });
        },
      }
    );

    reset();
  };

  const busy = isPending || isStreaming;

  return (
    <form className="w-full" onSubmit={handleSubmit(handlePerguntar)} data-cy="prompt-form">
      <div className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 shadow-lg shadow-black/10 transition focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20">
        <input
          type="text"
          data-cy="prompt-input"
          placeholder="Olá, como posso te ajudar?"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-gray-200 outline-none placeholder:text-gray-400 disabled:opacity-50 xs:text-base"
          disabled={busy}
          {...register("message", { required: true })}
        />
        <button
          type="submit"
          disabled={busy}
          data-cy="prompt-submit"
          className="rounded-lg p-2 text-gray-300 transition hover:bg-gray-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={busy ? "Aguarde a resposta" : "Enviar mensagem"}
        >
          <TbSend size={20} className="text-gray-300" />
        </button>
      </div>
    </form>
  );
}
