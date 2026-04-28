import axios from "axios";

const ip = window.location.hostname;

const api = axios.create({
  baseURL: `http://${ip}:8000`,
});

export default api;