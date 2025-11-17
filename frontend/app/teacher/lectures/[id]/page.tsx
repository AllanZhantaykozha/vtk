import { LectureViewPage } from "@/src/page/TeacherPage/LectureViewPage";

export default function Page({ params }: { params: { id: string } }) {
  return <LectureViewPage id={Number(params.id)} />;
}
