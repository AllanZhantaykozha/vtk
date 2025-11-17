import {
  NotificationListIsland,
  NotificationSortIsland,
} from "@/src/widgets/AdminPage/Notification";

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
