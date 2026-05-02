import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const CHAT_USER_ID = "2d74241b-300e-409e-8041-f96d769a6787";

const fetchChats = async (userId) => {
  const response = await api.get("/api/chat/listarchats", {
    params: {
      user_id: userId,
    },
  });

  return response.data ?? [];
};

const fetchChatMessages = async ({ userId, chatId }) => {
  const response = await api.get("/api/chat/listarmensagem", {
    params: {
      userid: userId,
      chatID: chatId,
    },
  });

  return [...(response.data ?? [])].sort((firstMessage, secondMessage) => (
    Number(firstMessage.id) - Number(secondMessage.id)
  ));
};

const fetchChatFeedbacks = async ({ userId, chatId }) => {
  const response = await api.get("/api/chat/listarfeedback", {
    params: {
      userid: userId,
      chatID: chatId,
    },
  });

  return response.data ?? [];
};

export function useChatData(enabled = true, userId = CHAT_USER_ID){
  const query = useQuery({
    queryFn: () => fetchChats(userId),
    queryKey: ['chat-data', userId],
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(userId),
  })

  return query;
}

export function useChatFeedbacks(chatId, enabled = true, userId = CHAT_USER_ID) {
  const query = useQuery({
    queryFn: () => fetchChatFeedbacks({ userId, chatId }),
    queryKey: ['chat-feedback', userId, chatId],
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(userId) && Boolean(chatId),
  });

  return query;
}

export function useChatMessages(chatId, enabled = true, userId = CHAT_USER_ID) {
  const query = useQuery({
    queryFn: () => fetchChatMessages({ userId, chatId }),
    queryKey: ['chat-messages', userId, chatId],
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(userId) && Boolean(chatId),
  });

  return query;
}

