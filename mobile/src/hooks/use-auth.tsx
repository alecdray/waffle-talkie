import * as Device from "expo-device";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getStoredJson, storeJson } from "../store/store";
import { UserAuth } from "../types/auth";
import { ApiClient } from "../api/client";
import { AuthClient } from "../api/auth";

const AUTH_STORAGE_KEY = "auth-data" as const;

interface AuthContextProps {
  auth: UserAuth | null;
  isLoading: boolean;
  error: string | null;
  register: (name: string) => Promise<void>;
  login: () => Promise<UserAuth | void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  auth: null,
  isLoading: true,
  error: null,
  register: async () => Promise.resolve(),
  login: async () => Promise.resolve(),
  logout: async () => Promise.resolve(),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<UserAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDeviceId = () => {
    return Device.deviceName || Device.modelId || "unknown-device";
  };

  const authApi = useMemo(() => {
    return new AuthClient(new ApiClient());
  }, []);

  useEffect(() => {
    getStoredJson<UserAuth>(AUTH_STORAGE_KEY)
      .then((storedAuth) => {
        if (storedAuth) {
          setAuth({
            ...storedAuth,
            tokenExpiresAt: storedAuth.tokenExpiresAt
              ? new Date(storedAuth.tokenExpiresAt)
              : undefined,
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const register = async (name: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const deviceId = getDeviceId();
      const response = await authApi.registerUser({
        name,
        device_id: deviceId,
      });

      const authData: UserAuth = {
        name,
        userId: response.user_id,
        deviceId,
        approved: false,
      };

      await storeJson(AUTH_STORAGE_KEY, authData);
      setAuth(authData);
    } catch (err) {
      console.error("Failed to register:", err);
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async () => {
    let authData: UserAuth | null = null;
    try {
      setError(null);
      setIsLoading(true);

      const deviceId = getDeviceId();
      const response = await authApi.loginUser({
        device_id: deviceId,
      });

      authData = {
        name: response.name,
        userId: response.user_id,
        deviceId,
        approved: true,
        token: response.token,
        tokenExpiresAt: new Date(response.token_expires_at),
      };

      await storeJson(AUTH_STORAGE_KEY, authData);
      setAuth(authData);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }

    return authData;
  }, [authApi]);

  const logout = async () => {
    try {
      await storeJson(AUTH_STORAGE_KEY, null);
      setAuth(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        isLoading,
        error,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
