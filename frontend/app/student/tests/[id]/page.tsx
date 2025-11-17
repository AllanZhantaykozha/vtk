import { TestSubmitPage } from "@/src/page/StudentPage/TestSumbitPage";

export default function Page({ params }: { params: { id: string } }) {
  return <TestSubmitPage id={Number(params.id)} />;
}
