import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

// ── Fetch functions ──────────────────────────────────────────────────────────

const fetchBases = async () => {
  const response = await api.get("/api/base_conhecimento/listarbase");
  return response.data ?? [];
};

const fetchDocuments = async (baseID) => {
  const response = await api.get("/api/base_conhecimento/listardocumentosbase", {
    params: { baseID },
  });
  return response.data ?? [];
};

const activateBase = async (baseID) => {
  const response = await api.post(`/api/base_conhecimento/ativarbase?baseID=${baseID}`);
  return response.data;
};

const deactivateBase = async (baseID) => {
  const response = await api.post(`/api/base_conhecimento/desativarbase?baseID=${baseID}`);
  return response.data;
};

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useKnowledgeBases() {
  return useQuery({
    queryFn: fetchBases,
    queryKey: ["knowledge-bases"],
    refetchOnWindowFocus: false,
  });
}

export function useKnowledgeBaseDocuments(baseID, enabled = true) {
  return useQuery({
    queryFn: () => fetchDocuments(baseID),
    queryKey: ["knowledge-base-documents", baseID],
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(baseID),
  });
}

export function useActivateBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateBase,
    onMutate: async (baseID) => {
      await queryClient.cancelQueries({ queryKey: ["knowledge-bases"] });
      const previous = queryClient.getQueryData(["knowledge-bases"]);

      queryClient.setQueryData(["knowledge-bases"], (old) =>
        old?.map((b) => ({
          ...b,
          status: b.id === baseID ? "ATIVO" : "DESATIVADO",
        }))
      );

      return { previous };
    },
    onError: (_err, _baseID, context) => {
      queryClient.setQueryData(["knowledge-bases"], context?.previous);
    },
  });
}

export function useDeactivateBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateBase,
    onMutate: async (baseID) => {
      await queryClient.cancelQueries({ queryKey: ["knowledge-bases"] });
      const previous = queryClient.getQueryData(["knowledge-bases"]);

      queryClient.setQueryData(["knowledge-bases"], (old) =>
        old?.map((b) => ({
          ...b,
          status: b.id === baseID ? "DESATIVADO" : b.status,
        }))
      );

      return { previous };
    },
    onError: (_err, _baseID, context) => {
      queryClient.setQueryData(["knowledge-bases"], context?.previous);
    },
  });
}
