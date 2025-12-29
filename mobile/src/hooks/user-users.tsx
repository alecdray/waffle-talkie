import { useEffect, useState } from "react";
import { useClient } from "./use-client";
import { User } from "../types/users";

export const useUsers = () => {
  const { getClient } = useClient();
  const [users, setUsers] = useState<Map<User["id"], User>>(new Map());

  const refreshUsers = async () => {
    try {
      const response = await (await getClient()).users.getUsers();
      setUsers(new Map(response.users.map((user) => [user.id, user])));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  return { users, refreshUsers };
};
