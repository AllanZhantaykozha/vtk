import { API } from "@/src/app/api/client";
import { User } from "../types";
import { ROUTES } from "@/src/app/api/routes";
import { UserFormData } from "@/src/widgets/CreatePage/CreateForm";

export async function createUser(
  userData: UserFormData
): Promise<User | string> {
  try {
    const response = await API<User>({
      url: ROUTES.users.create.path,
      method: ROUTES.users.create.method,
      data: userData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function updateUser(
  id: number,
  userData: Partial<UserFormData>
): Promise<User | string> {
  try {
    const response = await API<User>({
      url: ROUTES.users.update.path + id,
      method: ROUTES.users.update.method,
      params: { id: id.toString() },
      data: userData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function deleteUser(id: number): Promise<void | string> {
  try {
    await API<void>({
      url: ROUTES.users.delete.path + id,
      method: ROUTES.users.delete.method,
    });

    return;
  } catch (err) {
    return String(err);
  }
}
