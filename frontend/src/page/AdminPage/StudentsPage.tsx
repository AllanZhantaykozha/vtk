import {
  StudentListIsland,
  StudentSortIsland,
} from "@/src/widgets/AdminPage/Student";

export function StudentsPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <StudentListIsland />
        <StudentSortIsland />
      </div>
    </div>
  );
}
