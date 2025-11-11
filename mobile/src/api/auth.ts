import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";
import { API_URL, createHeaders } from "./config";

export const registerUser = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Registration failed");
  }

  return response.json();
};

export const loginUser = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Login failed");
  }

  return response.json();
};
