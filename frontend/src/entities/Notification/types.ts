import { User } from "../User/types";
import { NotificationStatus } from "../User/types/types";

export interface AppNotification {
  id: number;
  userIds: number[];
  users: User[];
  text: string;
  status: NotificationStatus;
  createdAt: Date;
  read: boolean;
}
