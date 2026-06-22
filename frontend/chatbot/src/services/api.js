import axios from "axios";
import { auth } from "../firebase";

const isE2EAuthEnabled = import.meta.env.VITE_E2E_AUTH === "true";
const baseURL = isE2EAuthEnabled ? "" : `http://${window.location.hostname}:8000`;

const api = axios.create({
  baseURL,
});

export async function getAuthHeaders() {
  if (isE2EAuthEnabled) {
    return {
      Authorization: "Bearer e2e-token",
    };
  }

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
  if (isE2EAuthEnabled) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = "Bearer e2e-token";
    return config;
  }

  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
