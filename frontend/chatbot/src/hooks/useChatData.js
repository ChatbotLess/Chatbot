import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const CHAT_USER_ID = "560546fc-3701-470e-8263-47ea8c8b4a8d";

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

export function useChatMessages(chatId, enabled = true, userId = CHAT_USER_ID) {
  const query = useQuery({
    queryFn: () => fetchChatMessages({ userId, chatId }),
    queryKey: ['chat-messages', userId, chatId],
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(userId) && Boolean(chatId),
  });

  return query;
}

