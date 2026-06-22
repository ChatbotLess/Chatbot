import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/AuthProvider/AuthProvider";
import api from "../services/api";

const fetchUsers = async () => {
  const response = await api.get("/api/users/");
  return response.data ?? [];
};

const createBackendUser = async (user) => {
  const response = await api.post("/api/users/User/", {
    firebase_uid: user.uid,
    email: user.email,
    password: `firebase-${user.uid}`,
    name: getBackendUserName(user),
  });

  return response.data;
};

const getBackendUserName = (user) => {
  const rawName = user.displayName || user.email?.split("@")[0] || "Usuario Chatbot";
  const name = rawName.replace(/[^a-zA-Z\s]/g, " ").replace(/\s+/g, " ").trim();

  return name.length >= 3 ? name : "Usuario Chatbot";
};

const fetchKnowledgeBases = async () => {
  const response = await api.get("/api/base_conhecimento/listarbase");
  return response.data ?? [];
};

const fetchDocuments = async () => {
  const response = await api.get("/api/base_conhecimento/listardocumentos");
  return response.data ?? [];
};

const uploadDocument = async ({ baseId, userId, document }) => {
  const formData = new FormData();
  formData.append("file", document.file);

  const response = await api.post("/api/base_conhecimento/upload", formData, {
    params: {
      base_id: baseId,
      user_id: userId,
      tipo: document.tipo,
    },
  });

  if (response.data?.erro) {
    throw new Error(
      Array.isArray(response.data.erro)
        ? response.data.erro.join(", ")
        : String(response.data.erro)
    );
  }

  return response.data;
};

export function useBackendUser(enabled = true) {
  const { user } = useContext(AuthContext);

  return useQuery({
    queryKey: ["backend-user", user?.uid],
    queryFn: async () => {
      if (!user?.uid || !user?.email) {
        throw new Error("Usuario autenticado nao encontrado.");
      }

      const users = await fetchUsers();
      const existingUser = users.find(
        (backendUser) =>
          backendUser.firebase_uid === user.uid || backendUser.email === user.email
      );

      if (existingUser) {
        return existingUser;
      }

      try {
        return await createBackendUser(user);
      } catch (error) {
        const updatedUsers = await fetchUsers();
        const createdUser = updatedUsers.find(
          (backendUser) =>
            backendUser.firebase_uid === user.uid || backendUser.email === user.email
        );

        if (createdUser) {
          return createdUser;
        }

        throw error;
      }
    },
    enabled: enabled && Boolean(user?.uid),
    refetchOnWindowFocus: false,
  });
}

export function useKnowledgeBases(enabled = true) {
  return useQuery({
    queryKey: ["knowledge-bases"],
    queryFn: fetchKnowledgeBases,
    enabled,
    refetchOnWindowFocus: false,
  });
}

export function useKnowledgeBaseDocuments() {
  return useQuery({
    queryKey: ["knowledge-base-documents"],
    queryFn: fetchDocuments,
    refetchOnWindowFocus: false,
  });
}

export function useUploadDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ baseId, userId, documents }) => {
      return Promise.all(
        documents.map((document) => uploadDocument({ baseId, userId, document }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base-documents"] });
    },
  });
}
