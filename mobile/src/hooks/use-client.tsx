import { useAuth } from "./use-auth";
import { ApiClient } from "../api/client";

export const useClient = (): { getClient: () => Promise<ApiClient> } => {
  const { auth, login } = useAuth();

  const getClient = async () => {
    let token = auth?.token;
    if (auth?.tokenExpiresAt && auth.tokenExpiresAt < new Date()) {
      try {
        const freshAuth = await login();
        token = freshAuth?.token;
      } catch (error) {
        console.error("Failed to refresh token: ", error);
      }
    }

    const api = new ApiClient({ token: token });
    return api;
  };

  return { getClient };
};
