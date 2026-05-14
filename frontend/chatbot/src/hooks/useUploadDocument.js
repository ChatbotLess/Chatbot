import { useMutation } from "@tanstack/react-query";
import api from "../services/api";

const uploadDocument = async ({ file, baseId, tipo }) => {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams({
    base_id: baseId,
    user_id: "0e5a72b0-77c6-4354-98fd-302b902da030",
    tipo,
  });

  const response = await api.post(
    `/api/base_conhecimento/upload?${params.toString()}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
};

export function useUploadDocument() {
  return useMutation({
    mutationFn: uploadDocument,
  });
}
