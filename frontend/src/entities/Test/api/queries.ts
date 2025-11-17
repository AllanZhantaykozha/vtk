import { API } from "@/src/apps/api/client";
import { ROUTES } from "@/src/apps/api/routes";
import { Statistic, Test } from "../types";
import { TestParams } from "@/src/shared/lib/stores/testStore";

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

export async function getMyTests(): Promise<Test[] | string> {
  try {
    const response = await API<Test[]>({
      url: ROUTES.tests.getMyTests.path,
      method: ROUTES.tests.getMyTests.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function getAllTests(
  filters?: TestParams
): Promise<Test[] | string> {
  let queryString = "";
  if (filters) {
    const params = Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [key, String(value)])
    );
    queryString = "?" + new URLSearchParams(params).toString();
  }

  try {
    const response = await API<Test[]>({
      url: ROUTES.tests.getAll.path + queryString,
      method: ROUTES.tests.getAll.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}

export async function getOneTest(id: number): Promise<Test | string> {
  try {
    const response = await API<Test>({
      url: ROUTES.tests.getById.path + id,
      method: ROUTES.tests.getById.method,
    });

    return response.data;
  } catch (err) {
    return String(err);
  }
}
