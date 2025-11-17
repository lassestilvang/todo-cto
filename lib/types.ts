export type Priority = "high" | "medium" | "low" | "none";

export type RecurrenceType =
  | "daily"
  | "weekly"
  | "weekdays"
  | "monthly"
  | "yearly"
  | "custom";

export type RecurrenceUnit = "day" | "week" | "month" | "year";
export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number;
  weekdays?: number[]; // 0 (Sunday) - 6 (Saturday)
  monthDay?: number;
  endDate?: Date | null;
  customText?: string;
  unit?: RecurrenceUnit;
}

export type ViewType = "today" | "next7days" | "upcoming" | "all" | "list" | "label";

export interface List {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  taskId: string;
  remindAt: Date;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  taskId: string;
  name: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  createdAt: Date;
}

export interface ChangeLog {
  id: string;
  taskId: string;
  field: string | null;
  previousValue: string | null;
  newValue: string | null;
  description: string;
  actor: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  scheduleDate: Date | null;
  deadline: Date | null;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  priority: Priority;
  recurrence: RecurrenceType | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  labels?: Label[];
  subtasks?: Subtask[];
  reminders?: Reminder[];
  attachments?: Attachment[];
  changeLogs?: ChangeLog[];
  list?: List;
}

export interface TaskWithRelations extends Task {
  labels: Label[];
  subtasks: Subtask[];
  reminders: Reminder[];
  attachments: Attachment[];
  changeLogs: ChangeLog[];
  list: List;
}

export interface CreateTaskInput {
  listId: string;
  title: string;
  description?: string;
  scheduleDate?: Date;
  deadline?: Date;
  estimatedMinutes?: number;
  priority?: Priority;
  recurrence?: RecurrenceType;
  labelIds?: string[];
  subtasks?: Array<{ title: string }>;
  reminders?: Array<{ remindAt: Date }>;
}

export interface UpdateTaskInput {
  id: string;
  listId?: string;
  title?: string;
  description?: string;
  scheduleDate?: Date | null;
  deadline?: Date | null;
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  priority?: Priority;
  recurrence?: RecurrenceType | null;
  completed?: boolean;
  labelIds?: string[];
}

export interface CreateListInput {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateListInput {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
}

export interface CreateLabelInput {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateLabelInput {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
}
