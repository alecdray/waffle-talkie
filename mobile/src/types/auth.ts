export interface UserAuth {
  name: string;
  userId: string;
  deviceId: string;
  approved: boolean;
  token?: string;
  tokenExpiresAt?: Date;
}

export interface RegisterRequest {
  name: string;
  device_id: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

export interface LoginRequest {
  device_id: string;
}

export interface LoginResponse {
  token: string;
  user_id: string;
  token_expires_at: string;
  name: string;
}
