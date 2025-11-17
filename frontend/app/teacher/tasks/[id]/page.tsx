import { TaskViewPage } from "@/src/page/TeacherPage/TaskViewPage";

export default function Page({ params }: { params: { id: string } }) {
  return <TaskViewPage id={Number(params.id)} />;
}
