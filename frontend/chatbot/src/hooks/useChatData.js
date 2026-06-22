import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { AuthContext } from "../context/AuthProvider/AuthProvider";

export function getChatQueryScope(user) {
  return user?.uid ? `firebase:${user.uid}` : "no-user";
}

export const chatQueryKeys = {
  chats: (scope) => ["chat-data", scope],
  feedbacks: (scope, chatId) => ["chat-feedback", scope, chatId],
  messages: (scope, chatId) => ["chat-messages", scope, chatId],
};

const fetchChats = async () => {
  const response = await api.get("/api/chat/listarchats");

  return response.data ?? [];
};

const fetchChatMessages = async (chatId) => {
  const response = await api.get("/api/chat/listarmensagem", {
    params: {
      chatID: chatId,
    },
  });

  return [...(response.data ?? [])].sort((firstMessage, secondMessage) => (
    Number(firstMessage.id) - Number(secondMessage.id)
  ));
};

const fetchChatFeedbacks = async (chatId) => {
  const response = await api.get("/api/chat/listarfeedback", {
    params: {
      chatID: chatId,
    },
  });

  return response.data ?? [];
};

export function useChatData(enabled = true) {
  const { user } = useContext(AuthContext);
  const chatScope = getChatQueryScope(user);

  return useQuery({
    queryFn: fetchChats,
    queryKey: chatQueryKeys.chats(chatScope),
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(user?.uid),
  });
}

export function useChatFeedbacks(chatId, enabled = true) {
  const { user } = useContext(AuthContext);
  const chatScope = getChatQueryScope(user);

  return useQuery({
    queryFn: () => fetchChatFeedbacks(chatId),
    queryKey: chatQueryKeys.feedbacks(chatScope, chatId),
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(user?.uid) && Boolean(chatId),
  });
}

export function useChatMessages(chatId, enabled = true) {
  const { user } = useContext(AuthContext);
  const chatScope = getChatQueryScope(user);

  return useQuery({
    queryFn: () => fetchChatMessages(chatId),
    queryKey: chatQueryKeys.messages(chatScope, chatId),
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(user?.uid) && Boolean(chatId),
  });
}
