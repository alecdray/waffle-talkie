import { useMemo } from "react";
import { useAuth } from "./use-auth";
import { ApiClient } from "../api/client";

export const useClient = (): { api: ApiClient } => {
  const { login, logout, auth } = useAuth();

  const api = useMemo(() => {
    const api = new ApiClient(auth?.token);
    api.setErrorHandler((error) => {
      console.error(error);
      if (error.isTokenExpired()) {
        try {
          login();
        } catch (error) {
          console.error("Failed to refresh token: ", error);
          logout();
        }
      } else {
        throw error;
      }
    });
    return api;
  }, [auth?.token, login, logout]);

  return { api };
};
