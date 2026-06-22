import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { useBackendUser } from "./useKnowledgeBaseDocuments";

export const CHAT_USER_ID = null;

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
  const backendUserQuery = useBackendUser(enabled && !userId);
  const resolvedUserId = userId ?? backendUserQuery.data?.id;

  const query = useQuery({
    queryFn: () => fetchChats(resolvedUserId),
    queryKey: ['chat-data', resolvedUserId],
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(resolvedUserId),
  })

  return {
    ...query,
    data: query.data ?? [],
    isError: query.isError || backendUserQuery.isError,
    isLoading: query.isLoading || backendUserQuery.isLoading,
    userId: resolvedUserId,
  };
}

export function useChatFeedbacks(chatId, enabled = true, userId = CHAT_USER_ID) {
  const backendUserQuery = useBackendUser(enabled && !userId);
  const resolvedUserId = userId ?? backendUserQuery.data?.id;

  const query = useQuery({
    queryFn: () => fetchChatFeedbacks({ userId: resolvedUserId, chatId }),
    queryKey: ['chat-feedback', resolvedUserId, chatId],
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(resolvedUserId) && Boolean(chatId),
  });

  return {
    ...query,
    data: query.data ?? [],
    isError: query.isError || backendUserQuery.isError,
    isLoading: query.isLoading || backendUserQuery.isLoading,
    userId: resolvedUserId,
  };
}

export function useChatMessages(chatId, enabled = true, userId = CHAT_USER_ID) {
  const backendUserQuery = useBackendUser(enabled && !userId);
  const resolvedUserId = userId ?? backendUserQuery.data?.id;

  const query = useQuery({
    queryFn: () => fetchChatMessages({ userId: resolvedUserId, chatId }),
    queryKey: ['chat-messages', resolvedUserId, chatId],
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(resolvedUserId) && Boolean(chatId),
  });

  return {
    ...query,
    data: query.data ?? [],
    isError: query.isError || backendUserQuery.isError,
    isLoading: query.isLoading || backendUserQuery.isLoading,
    userId: resolvedUserId,
  };
}

