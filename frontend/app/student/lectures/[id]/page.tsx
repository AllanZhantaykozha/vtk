import { LectureViewPage } from "@/src/page/StudentPage/LectureViewPage";

export default function Page({ params }: { params: { id: string } }) {
  return <LectureViewPage id={Number(params.id)} />;
}
