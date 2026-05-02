import { useMutation } from "@tanstack/react-query";
import api from "../services/api";

const sendFeedback = async ({ messageId, tipo, mensagem_feedback = "" }) => {
  const response = await api.post(`/api/chat/mensagens/${messageId}/feedback`, {
    tipo,
    mensagem_feedback,
  });

  return response.data;
};

export function useFeedbackMutate() {
  return useMutation({
    mutationFn: sendFeedback,
  });
}
