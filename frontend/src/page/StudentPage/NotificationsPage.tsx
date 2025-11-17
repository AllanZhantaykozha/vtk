import {
  NotificationListIsland,
  NotificationSortIsland,
} from "@/src/widgets/StudentPage/NotificationPage";

export function NotificationPage() {
  return (
    <div className="">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <NotificationListIsland />
        <NotificationSortIsland />
      </div>
    </div>
  );
}
