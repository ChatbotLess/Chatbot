import axios from "axios";
import { auth } from "../firebase";

const ip = window.location.hostname;

const api = axios.create({
  baseURL: `http://${ip}:8000`,
});

export async function getAuthHeaders() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Usuario nao autenticado.");
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
