import { useMutation } from "@tanstack/react-query";
import api from "../services/api";

const uploadDocument = async ({ file, baseId, tipo }) => {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams({
    base_id: baseId,
    user_id: "06101211-9724-48a7-89e7-71e4e9444617",
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
