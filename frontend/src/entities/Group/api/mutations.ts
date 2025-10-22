import { API } from "@/src/app/api/client";
import { ROUTES } from "@/src/app/api/routes";
import { GroupFormData } from "@/src/widgets/CreatePage/CreateForm";
import { Group } from "../../Group/types";

export async function createGroup(
  groupData: GroupFormData
): Promise<Group | string> {
  try {
    const response = await API<Group>({
      url: ROUTES.groups.create.path,
      method: ROUTES.groups.create.method,
      data: groupData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function updateGroup(
  id: number,
  groupData: Partial<GroupFormData>
): Promise<Group | string> {
  try {
    const response = await API<Group>({
      url: ROUTES.groups.update.path + id,
      method: ROUTES.groups.update.method,
      data: groupData,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function deleteGroup(id: number): Promise<void | string> {
  try {
    await API<void>({
      url: ROUTES.groups.delete.path + id,
      method: ROUTES.groups.delete.method,
    });

    return;
  } catch (err) {
    return String(err);
  }
}
