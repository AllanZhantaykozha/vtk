import { API } from "@/src/app/api/client";
import { ROUTES } from "@/src/app/api/routes";
import { Statistic } from "../types";

export async function getStatistic(
  groupId?: string
): Promise<Statistic[] | string> {
  try {
    let url = ROUTES.tests.getStatistic.path;
    if (groupId !== undefined) {
      url += `?groupId=${groupId}`;
    }

    const response = await API<Statistic[]>({
      url,
      method: ROUTES.tests.getStatistic.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
