import { UsersResponse } from "../types/users";
import { ApiClient } from "./client";

export class UsersClient {
  constructor(private api: ApiClient) {}

  getUsers = async (): Promise<UsersResponse> => {
    const response = await this.api.fetchJson<UsersResponse>("/api/users", {
      method: "GET",
    });

    return response;
  };
}
