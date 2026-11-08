import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

// Automatically attach the token to protected API requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Don't attach an old token to login or register requests
      const isAuthRequest =
        config.url?.includes("/users/login") ||
        config.url?.includes("/users/register");

      if (!isAuthRequest) {
        const token = localStorage.getItem("token");

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;