import { Platform } from "react-native";

const getDefaultApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "ios") {
      return "http://localhost:8080";
    } else if (Platform.OS === "android") {
      return "http://10.0.2.2:8080";
    }
    return "http://localhost:8080";
  }
  return "https://waffle-talkie.shmoopysworld.com";
};

export const API_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();

export const createHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};
