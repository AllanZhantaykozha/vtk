import { TestViewPage } from "@/src/page/TeacherPage/TestViewPage";

export default function Page({ params }: { params: { id: string } }) {
  return <TestViewPage id={Number(params.id)} />;
}
