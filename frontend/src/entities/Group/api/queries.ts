import { API } from "@/src/app/api/client";
import { ROUTES } from "@/src/app/api/routes";
import { Group } from "../types";

export async function getGroups(groupId?: string): Promise<Group[] | string> {
  try {
    let url = ROUTES.groups.getAll.path;
    if (groupId !== undefined) {
      url += `?groupId=${groupId}`;
    }

    const response = await API<Group[]>({
      url,
      method: ROUTES.tests.getStatistic.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
