import { TaskSubmitPage } from "@/src/page/StudentPage/TaskSumbitPage";

export default function Page({ params }: { params: { id: string } }) {
  return <TaskSubmitPage id={Number(params.id)} />;
}
