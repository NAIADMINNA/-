export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Category {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  description?: string;
}

export interface UserAssignee {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor: string;
  lineUserId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24-hour)
  categoryId: string;
  priority: Priority;
  status: TaskStatus;
  assigneeId?: string;
  reminderMinutesBefore: number; // 0 (at time), 15, 30, 60, 1440 (1 day)
  reminded: boolean;
  remindedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface LineFriendMember {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  type: 'user' | 'group';
  joinedAt: string;
  lastActive?: string;
}

export interface SystemSettings {
  lineChannelAccessToken: string;
  lineUserId: string;
  lineChannelSecret: string;
  lineBotBasicId?: string; // e.g. "@secretary_bot" or Line ID for Add Friend Link
  googleSheetWebhookUrl: string;
  googleSheetId: string;
  defaultReminderOffsetMinutes: number;
  autoReminderEnabled: boolean;
  soundEnabled: boolean;
  botName: string;
  organizationName: string;
  lineNotificationTheme?: 'executive-slate' | 'apple-modern' | 'vibrant-emerald' | 'sunset-coral' | 'champagne-gold' | 'category-color';
  morningBriefingEnabled?: boolean;
  morningBriefingTime?: string; // e.g. "07:30" (HH:mm)
  lastMorningBriefingDate?: string; // e.g. "2026-10-18" to prevent duplicate sends on same day
  autoSyncGoogleSheet?: boolean;
  lastGoogleSheetSyncAt?: string;
}

export interface NotificationLog {
  id: string;
  taskId: string;
  taskTitle: string;
  sentAt: string;
  status: 'sent' | 'simulated' | 'failed';
  message: string;
  recipient: string;
}
