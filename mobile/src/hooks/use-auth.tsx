import * as Device from "expo-device";
import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, registerUser } from "../api/auth";
import { getStoredJson, storeJson } from "../store/store";
import { UserAuth } from "../types/auth";

const AUTH_STORAGE_KEY = "auth-data" as const;

interface AuthContextProps {
  auth: UserAuth | null;
  isLoading: boolean;
  error: string | null;
  register: (name: string) => Promise<void>;
  login: () => Promise<void>;
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

  useEffect(() => {
    getStoredJson<UserAuth>(AUTH_STORAGE_KEY)
      .then((storedAuth) => {
        if (storedAuth) {
          setAuth(storedAuth);
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
      const response = await registerUser({
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
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const deviceId = getDeviceId();
      const response = await loginUser({
        device_id: deviceId,
      });

      const authData: UserAuth = {
        name: response.name,
        userId: response.user_id,
        deviceId,
        approved: true,
        token: response.token,
      };

      await storeJson(AUTH_STORAGE_KEY, authData);
      setAuth(authData);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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
