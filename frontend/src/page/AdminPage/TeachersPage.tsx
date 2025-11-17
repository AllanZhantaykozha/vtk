import {
  TeacherListIsland,
  TeacherSortIsland,
} from "@/src/widgets/AdminPage/Teacher/";

export function TeachersPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <TeacherListIsland />
        <TeacherSortIsland />
      </div>
    </div>
  );
}
