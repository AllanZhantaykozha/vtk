import { User } from "../User/types/types";

export interface Notification {
  id: number;
  userId: number;
  user: User;
  text: string;
  status: Notification;
  createdAt: Date;
  read: boolean;
}
