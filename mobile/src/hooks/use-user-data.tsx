import { createContext, useContext, useEffect, useState } from "react";
import { getStoredJson, storeJson, StoreKeyUserData } from "../store/store";

interface UserData {
  name: string;
}

interface UserDataContextProps {
  userData: UserData | null;
  isLoading: boolean;
  error: Error | null;
  updateUserData: (newUserData: UserData) => Promise<void>;
  removeUserData: () => Promise<void>;
}

export const UserDataContext = createContext<UserDataContextProps>({
  userData: null,
  isLoading: true,
  error: null,
  updateUserData: async () => Promise.resolve(),
  removeUserData: async () => Promise.resolve(),
});

export const UserDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getStoredJson<UserData>(StoreKeyUserData)
      .then(setUserData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  const updateUserData = async (newUserData: UserData) => {
    try {
      await storeJson(StoreKeyUserData, newUserData);
      setUserData(newUserData);
    } catch (error) {
      setError(error as Error);
    }
  };

  const removeUserData = async () => {
    try {
      await storeJson(StoreKeyUserData, null);
      setUserData(null);
    } catch (error) {
      setError(error as Error);
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        userData,
        isLoading,
        error,
        updateUserData,
        removeUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);
