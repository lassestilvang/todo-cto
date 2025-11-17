import { Task, TaskWithRelations, RecurrenceRule } from "@/lib/types";
import { tasks, lists as listsTable, labels as labelsTable, reminders as remindersTable, attachments as attachmentsTable, subtasks as subtasksTable, changeLogs as changeLogsTable } from "./schema";
import { eq, desc, asc } from "drizzle-orm";
import { db } from "./index";

type TaskQueryRow = typeof tasks.$inferSelect;
type ListQueryRow = typeof listsTable.$inferSelect;
type LabelQueryRow = typeof labelsTable.$inferSelect;
type SubtaskQueryRow = typeof subtasksTable.$inferSelect;
type ReminderQueryRow = typeof remindersTable.$inferSelect;
type AttachmentQueryRow = typeof attachmentsTable.$inferSelect;
type ChangeLogQueryRow = typeof changeLogsTable.$inferSelect;

interface TaskLabelJoin {
  label: LabelQueryRow;
}

export function timestampToDate(value: number | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return new Date(value * 1000);
  }
  return value;
}

export function dateToUnix(date: Date | null | undefined): number | null {
  if (!date) return null;
  return Math.floor(date.getTime() / 1000);
}

export function serializeRecurrence(raw: string | null): RecurrenceRule | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed as RecurrenceRule;
  } catch (error) {
    console.error("Failed to parse recurrence", error);
    return null;
  }
}

export function deserializeRecurrence(rule: RecurrenceRule | null): string | null {
  if (!rule) return null;
  return JSON.stringify(rule);
}

export function mapTask(row: TaskQueryRow): Task {
  const recurrenceRule = serializeRecurrence(row.recurrence);
  return {
    id: row.id,
    listId: row.listId,
    title: row.title,
    description: row.description,
    scheduleDate: timestampToDate(row.scheduleDate ?? null),
    deadline: timestampToDate(row.deadline ?? null),
    estimatedMinutes: row.estimatedMinutes ?? null,
    actualMinutes: row.actualMinutes ?? null,
    priority: row.priority as Task["priority"],
    recurrence: recurrenceRule?.type ?? null,
    completed: Boolean(row.completed),
    completedAt: timestampToDate(row.completedAt ?? null),
    createdAt: timestampToDate(row.createdAt) ?? new Date(),
    updatedAt: timestampToDate(row.updatedAt) ?? new Date(),
  };
}

export async function getTaskWithRelations(taskId: string): Promise<TaskWithRelations | null> {
  const taskRow = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      list: true,
      changeLogs: {
        orderBy: (fields) => [desc(fields.createdAt)],
      },
      reminders: true,
      attachments: true,
      subtasks: {
        orderBy: (fields) => [asc(fields.position)],
      },
      labels: {
        with: {
          label: true,
        },
      },
    },
  });

  if (!taskRow || !taskRow.list) {
    return null;
  }

  const labelsList = taskRow.labels.map((entry: TaskLabelJoin) => ({
    id: entry.label.id,
    name: entry.label.name,
    color: entry.label.color,
    icon: entry.label.icon,
    createdAt: timestampToDate(entry.label.createdAt) ?? new Date(),
    updatedAt: timestampToDate(entry.label.updatedAt) ?? new Date(),
  }));

  const changeLogsList = taskRow.changeLogs.map((log: ChangeLogQueryRow) => ({
    id: log.id,
    taskId: log.taskId,
    field: log.field,
    previousValue: log.previousValue,
    newValue: log.newValue,
    description: log.description,
    actor: log.actor,
    createdAt: timestampToDate(log.createdAt) ?? new Date(),
  }));

  const remindersList = taskRow.reminders.map((reminder: ReminderQueryRow) => ({
    id: reminder.id,
    taskId: reminder.taskId,
    remindAt: timestampToDate(reminder.remindAt) ?? new Date(),
    createdAt: timestampToDate(reminder.createdAt) ?? new Date(),
  }));

  const attachmentsList = taskRow.attachments.map((attachment: AttachmentQueryRow) => ({
    id: attachment.id,
    taskId: attachment.taskId,
    name: attachment.name,
    url: attachment.url,
    mimeType: attachment.mimeType,
    size: attachment.size,
    createdAt: timestampToDate(attachment.createdAt) ?? new Date(),
  }));

  const subtasksList = taskRow.subtasks.map((subtask: SubtaskQueryRow) => ({
    id: subtask.id,
    taskId: subtask.taskId,
    title: subtask.title,
    completed: Boolean(subtask.completed),
    position: subtask.position,
    createdAt: timestampToDate(subtask.createdAt) ?? new Date(),
    updatedAt: timestampToDate(subtask.updatedAt) ?? new Date(),
  }));

  const listRow: ListQueryRow = taskRow.list;

  return {
    ...mapTask(taskRow),
    list: {
      id: listRow.id,
      name: listRow.name,
      color: listRow.color,
      icon: listRow.icon,
      isDefault: Boolean(listRow.isDefault),
      createdAt: timestampToDate(listRow.createdAt) ?? new Date(),
      updatedAt: timestampToDate(listRow.updatedAt) ?? new Date(),
    },
    changeLogs: changeLogsList,
    reminders: remindersList,
    attachments: attachmentsList,
    subtasks: subtasksList,
    labels: labelsList,
  };
}
