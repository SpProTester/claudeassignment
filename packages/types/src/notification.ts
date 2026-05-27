import type { UUID, Timestamp } from "./common";

export type NotificationChannel = "in_app" | "email" | "sms" | "push";
export type NotificationType =
  | "application_received"
  | "application_status_changed"
  | "interview_scheduled"
  | "interview_reminder"
  | "offer_received"
  | "offer_deadline"
  | "job_alert"
  | "job_expiring"
  | "message_received"
  | "profile_viewed"
  | "subscription_expiring"
  | "payment_failed"
  | "system_announcement";

export interface Notification {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data: Record<string, string> | null;
  isRead: boolean;
  readAt: Timestamp | null;
  sentAt: Timestamp;
  createdAt: Timestamp;
}

export interface NotificationPreferences {
  userId: UUID;
  channels: Record<NotificationType, NotificationChannel[]>;
  updatedAt: Timestamp;
}
