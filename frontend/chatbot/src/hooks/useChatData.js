import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const fetchData = async () => {
  const userId = "2eead7ff-ea98-4cae-bb98-ec159c44458d";

  const response = await api.get("/api/chat/listarchats", {
    params: {
      user_id: userId,
    },
  });

  return response.data ?? [];
};

export function useChatData(enabled = true){
  const query = useQuery({
    queryFn: fetchData,
    queryKey: ['chat-data'],
    refetchOnWindowFocus: false,
    enabled
  })

  return query;
}

