import { User } from "../User/types";
import { NotificationStatus } from "../User/types/types";

export interface AppNotification {
  id: number;
  userId: number;
  user: User;
  text: string;
  status: NotificationStatus;
  createdAt: Date;
  read: boolean;
}
