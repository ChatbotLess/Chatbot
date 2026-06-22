import { useMutation } from "@tanstack/react-query";

/**
 * Envia uma mensagem para o backend via streaming (fetch nativo).
 * Retorna { chatId, stream } onde:
 *   - chatId: o ID do chat criado ou existente (lido do header X-Chat-Id)
 *   - stream: ReadableStream para consumo token a token
 */
const postMessage = async ({ userid, message, chatID = null }) => {
  const queryParams = new URLSearchParams({ userid, message });
  if (chatID) queryParams.set("chatID", chatID);

  const response = await fetch(`/api/rag/message?${queryParams.toString()}`, {
    method: "POST",
    headers: { accept: "*/*" },
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  const chatId = response.headers.get("X-Chat-Id");

  return { chatId, stream: response.body };
};

export function useMessageMutate() {
  return useMutation({
    mutationFn: postMessage,
  });
}
