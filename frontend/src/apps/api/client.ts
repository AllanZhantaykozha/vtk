import axios from "axios";

export const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

API.interceptors.request.use((config) => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (cookies) config.headers.Authorization = `Bearer ${cookies}`;
  }
  return config;
});
