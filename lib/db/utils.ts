import { Task, TaskWithRelations, RecurrenceRule, ChangeLog, Attachment, Reminder, Subtask, Label, List } from "@/lib/types";
import { tasks, lists, labels, reminders, attachments, subtasks, changeLogs, taskLabels } from "./schema";
import { eq, inArray, desc, asc } from "drizzle-orm";
import { db } from "./index";

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

export function mapTask(row: typeof tasks.$inferSelect): Task {
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

  if (!taskRow) {
    return null;
  }

  const labelsList = (taskRow.labels as any[]).map((entry) => ({
    id: entry.label.id,
    name: entry.label.name,
    color: entry.label.color,
    icon: entry.label.icon,
    createdAt: timestampToDate(entry.label.createdAt) ?? new Date(),
    updatedAt: timestampToDate(entry.label.updatedAt) ?? new Date(),
  }));

  return {
    ...mapTask(taskRow),
    list: {
      id: taskRow.list.id,
      name: taskRow.list.name,
      color: taskRow.list.color,
      icon: taskRow.list.icon,
      isDefault: Boolean(taskRow.list.isDefault),
      createdAt: timestampToDate(taskRow.list.createdAt) ?? new Date(),
      updatedAt: timestampToDate(taskRow.list.updatedAt) ?? new Date(),
    },
    changeLogs: (taskRow.changeLogs as any[]).map((log) => ({
      id: log.id,
      taskId: log.taskId,
      field: log.field,
      previousValue: log.previousValue,
      newValue: log.newValue,
      description: log.description,
      actor: log.actor,
      createdAt: timestampToDate(log.createdAt) ?? new Date(),
    })),
    reminders: (taskRow.reminders as any[]).map((reminder) => ({
      id: reminder.id,
      taskId: reminder.taskId,
      remindAt: timestampToDate(reminder.remindAt) ?? new Date(),
      createdAt: timestampToDate(reminder.createdAt) ?? new Date(),
    })),
    attachments: (taskRow.attachments as any[]).map((attachment) => ({
      id: attachment.id,
      taskId: attachment.taskId,
      name: attachment.name,
      url: attachment.url,
      mimeType: attachment.mimeType,
      size: attachment.size,
      createdAt: timestampToDate(attachment.createdAt) ?? new Date(),
    })),
    subtasks: (taskRow.subtasks as any[]).map((subtask) => ({
      id: subtask.id,
      taskId: subtask.taskId,
      title: subtask.title,
      completed: Boolean(subtask.completed),
      position: subtask.position,
      createdAt: timestampToDate(subtask.createdAt) ?? new Date(),
      updatedAt: timestampToDate(subtask.updatedAt) ?? new Date(),
    })),
    labels: labelsList,
  };
}
