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

const createBase = async ({ titulo, versao, descricao }) => {
  const response = await api.post("/api/base_conhecimento/criarbase", null, {
    params: { titulo, versao, descricao },
  });
  return response.data;
};

const updateBase = async ({ baseID, titulo, versao, descricao }) => {
  const response = await api.put(
    `/api/base_conhecimento/atualizarbase?baseID=${baseID}`,
    { titulo, versao, descricao }
  );
  return response.data;
};

const deleteBase = async (baseID) => {
  const response = await api.delete(
    `/api/base_conhecimento/excluirbase?baseID=${baseID}`
  );
  return response.data;
};

const reindexBase = async (baseID) => {
  const response = await api.post(
    `/api/base_conhecimento/reindexarbase?baseID=${baseID}`
  );
  return response.data;
};

const updateDocument = async ({ documentoID, nome_documento, tipo }) => {
  const response = await api.put(
    `/api/base_conhecimento/atualizardocumento?documentoID=${documentoID}`,
    { nome_documento, tipo }
  );
  return response.data;
};

const deleteDocument = async ({ documentoID }) => {
  const response = await api.delete(
    `/api/base_conhecimento/excluirdocumento?documentoID=${documentoID}`
  );
  return response.data;
};

const reindexDocument = async ({ documentoID }) => {
  const response = await api.post(
    `/api/base_conhecimento/reindexardocumento?documentoID=${documentoID}`
  );
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

export function useCreateBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBase,
    onSuccess: (createdBase) => {
      queryClient.setQueryData(["knowledge-bases"], (current = []) => [
        ...current.map((base) => ({
          ...base,
          status: "DESATIVADO",
        })),
        createdBase,
      ]);
      queryClient.invalidateQueries({ queryKey: ["knowledge-bases"] });
    },
  });
}

export function useUpdateBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBase,
    onSuccess: (updatedBase) => {
      queryClient.setQueryData(["knowledge-bases"], (current = []) =>
        current.map((base) => (base.id === updatedBase.id ? updatedBase : base))
      );
      queryClient.invalidateQueries({ queryKey: ["knowledge-bases"] });
    },
  });
}

export function useDeleteBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBase,
    onSuccess: (_result, baseID) => {
      queryClient.setQueryData(["knowledge-bases"], (current = []) =>
        current.filter((base) => base.id !== baseID)
      );
      queryClient.removeQueries({ queryKey: ["knowledge-base-documents", baseID] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-bases"] });
    },
  });
}

export function useReindexBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reindexBase,
    onSuccess: (_result, baseID) => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-documents", baseID] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDocument,
    onSuccess: (updatedDocument) => {
      queryClient.setQueryData(
        ["knowledge-base-documents", updatedDocument.base],
        (current = []) =>
          current.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc))
      );
      queryClient.invalidateQueries({
        queryKey: ["knowledge-base-documents", updatedDocument.base],
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: (_result, variables) => {
      queryClient.setQueryData(
        ["knowledge-base-documents", variables.baseID],
        (current = []) => current.filter((doc) => doc.id !== variables.documentoID)
      );
      queryClient.invalidateQueries({
        queryKey: ["knowledge-base-documents", variables.baseID],
      });
    },
  });
}

export function useReindexDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reindexDocument,
    onSuccess: (updatedDocument) => {
      queryClient.setQueryData(
        ["knowledge-base-documents", updatedDocument.base],
        (current = []) =>
          current.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc))
      );
      queryClient.invalidateQueries({
        queryKey: ["knowledge-base-documents", updatedDocument.base],
      });
    },
  });
}
