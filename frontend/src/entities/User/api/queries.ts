import { API } from "@/src/app/api/client";
import { User } from "../types";
import { ROUTES } from "@/src/app/api/routes";

export async function getMe(): Promise<User | string> {
  try {
    const response = await API<User>({
      url: ROUTES.users.getMe.path,
      method: ROUTES.users.getMe.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
