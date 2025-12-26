import { AudioClient } from "./audio";
import { AuthClient } from "./auth";
import { API_URL, createHeaders } from "./config";

export class ClientError extends Error {
  status?: number;
  json?: Record<string, unknown>;

  constructor(message: string) {
    super(message);
    this.name = "ClientError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ClientError);
    }
  }

  withStatus(status: number): ClientError {
    this.status = status;
    return this;
  }

  withJson(json: Record<string, unknown>): ClientError {
    this.json = json;
    return this;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isTokenExpired(): boolean {
    return this.isUnauthorized() && this.json?.error === "expired token";
  }

  static isClientError(error: unknown): error is ClientError {
    return error instanceof ClientError;
  }
}

export class ApiClient {
  token?: string;
  auth: AuthClient;
  audio: AudioClient;
  errorHandler?: (error: ClientError) => void;

  constructor(token?: string) {
    this.token = token;
    this.auth = new AuthClient(this);
    this.audio = new AudioClient(this);
  }

  fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...createHeaders(this.token), ...init?.headers },
    });

    let respJson: Record<string, unknown> | null = null;
    try {
      respJson = await response.json();
    } catch {}

    if (!response.ok) {
      let respText: string | null = null;
      try {
        respText = await response.text();
      } catch {}

      let errorMsg = `failed to fetch ${init?.method || "GET"} ${path} with ${response.status} ${response.statusText}`;
      if (respText) {
        errorMsg += `: ${respText}`;
      }

      const clientError = new ClientError(errorMsg).withStatus(response.status);
      if (respJson) {
        clientError.withJson(respJson);
      }
      this.onError(clientError);
      throw clientError;
    }

    if (!respJson) {
      throw new ClientError("Unexpected response: no JSON data");
    }

    return respJson as T;
  };

  setErrorHandler = (handler: (error: ClientError) => void) => {
    this.errorHandler = handler;
  };

  onError = (error: ClientError) => {
    if (this.errorHandler) {
      this.errorHandler(error);
    } else {
      throw error;
    }
  };
}
