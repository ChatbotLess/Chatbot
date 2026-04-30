import { TbSend } from "react-icons/tb";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMessageMutate } from "../hooks/useMessageMutate";
import { useStream } from "../context/StreamContext/StreamProvider";
import { useQueryClient } from "@tanstack/react-query";
import { CHAT_USER_ID } from "../hooks/useChatData";

export function Promptbar() {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { mutate, isPending } = useMessageMutate();
  const { startStream, clearStream, isStreaming } = useStream();
  const queryClient = useQueryClient();

  const handlePerguntar = (data) => {
    const message = data.message?.trim();
    if (!message || isStreaming) return;

    // Limpa stream anterior
    clearStream();

    mutate(
      {
        userid: "2c70b932-81ba-4249-aed8-7be2fa65905c",
        message,
        chatID: conversationId ?? null,
      },
      {
        onSuccess: async ({ chatId, stream }) => {
          // Se é um chat novo, navega imediatamente para a rota correta
          if (!conversationId && chatId) {
            navigate(`/chat/${chatId}`);
          }

          // Lê o stream token a token
          await startStream(stream, message);

          // Stream acabou - aguarda o banco estar pronto ANTES de limpar os balões
          // refetchQueries retorna uma Promise que resolve quando o dado chegou
          await queryClient.refetchQueries({
            queryKey: ["chat-messages", CHAT_USER_ID, chatId ?? conversationId],
          });

          // Agora que o banco está no cache, remove os balões de streaming
          clearStream();

          // Atualiza a lista de chats na sidebar (não precisa aguardar)
          queryClient.invalidateQueries({
            queryKey: ["chat-data", CHAT_USER_ID],
          });
        },
      }
    );

    reset();
  };

  const busy = isPending || isStreaming;

  return (
    <form className="w-full" onSubmit={handleSubmit(handlePerguntar)}>
      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 gap-2">
        <input
          type="text"
          placeholder="Olá, como posso te ajudar?"
          className="flex bg-transparent outline-none text-gray-200 placeholder-gray-400 w-[100%] disabled:opacity-50"
          disabled={busy}
          {...register("message", { required: true })}
        />
        <button
          type="submit"
          disabled={busy}
          className="p-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-40"
        >
          <TbSend size={20} className="text-gray-300" />
        </button>
      </div>
    </form>
  );
}