import AsyncStorage from "@react-native-async-storage/async-storage";

declare const StoreKeyBrand: unique symbol;
type StoreKey = string & { readonly [StoreKeyBrand]: typeof StoreKeyBrand };

export const StoreKeyUserData: StoreKey = "user-data" as StoreKey;

export const storeJson = async <T>(key: string, value: T) => {
  const jsonValue = JSON.stringify(value);
  await AsyncStorage.setItem(key, jsonValue);
};

export const getStoredJson = async <T>(key: string): Promise<T | null> => {
  const jsonValue = await AsyncStorage.getItem(key);
  return jsonValue != null ? JSON.parse(jsonValue) : null;
};
