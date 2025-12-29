import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";
import { ApiClient } from "./client";

export class AuthClient {
  constructor(private api: ApiClient) {}

  registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await this.api.fetchJson<RegisterResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    return response;
  };

  loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await this.api.fetchJson<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response;
  };
}
