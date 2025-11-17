import { API } from "@/src/apps/api/client";
import { ROUTES } from "@/src/apps/api/routes";
import { Group } from "../types";

export interface GroupFilters {
  id?: string;
  name?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export async function getAllGroups(
  filters?: GroupFilters
): Promise<Group[] | string> {
  try {
    const params = new URLSearchParams();

    if (filters?.id) params.append("id", filters.id);
    if (filters?.name) params.append("name", filters.name);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.order) params.append("order", filters.order);

    const queryString = params.toString();
    const url = queryString
      ? `${ROUTES.groups.getAll.path}?${queryString}`
      : ROUTES.groups.getAll.path;

    const response = await API<Group[]>({
      url,
      method: ROUTES.groups.getAll.method,
    });
    console.log(response.data);

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function getGroupById(groupId: string): Promise<Group | string> {
  try {
    const response = await API<Group>({
      url: `${ROUTES.groups.getById.path}${groupId}`,
      method: ROUTES.groups.getById.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
