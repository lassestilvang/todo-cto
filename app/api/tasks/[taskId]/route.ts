import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  tasks,
  subtasks,
  reminders,
  taskLabels,
  changeLogs,
  attachments,
} from "@/lib/db/schema";
import { eq, notInArray } from "drizzle-orm";
import { dateToUnix, mapTask, timestampToDate, serializeRecurrence } from "@/lib/db/utils";
import { nanoid } from "@/lib/utils";
import { parseISO } from "date-fns";

interface TaskParams {
  params: {
    taskId: string;
  };
}

async function getTask(taskId: string) {
  return db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      list: true,
      labels: {
        with: {
          label: true,
        },
      },
      reminders: true,
      attachments: true,
      subtasks: {
        orderBy: (fields) => [fields.position],
      },
      changeLogs: {
        orderBy: (fields) => [fields.createdAt.desc()],
      },
    },
  });
}

export async function GET(_request: NextRequest, { params }: TaskParams) {
  try {
    const task = await getTask(params.taskId);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const mapped = {
      ...mapTask(task),
      list: {
        id: task.list.id,
        name: task.list.name,
        color: task.list.color,
        icon: task.list.icon,
        isDefault: Boolean(task.list.isDefault),
        createdAt: timestampToDate(task.list.createdAt) ?? new Date(),
        updatedAt: timestampToDate(task.list.updatedAt) ?? new Date(),
      },
      labels: task.labels.map((entry) => ({
        id: entry.label.id,
        name: entry.label.name,
        color: entry.label.color,
        icon: entry.label.icon,
        createdAt: timestampToDate(entry.label.createdAt) ?? new Date(),
        updatedAt: timestampToDate(entry.label.updatedAt) ?? new Date(),
      })),
      reminders: task.reminders.map((reminder) => ({
        id: reminder.id,
        taskId: reminder.taskId,
        remindAt: timestampToDate(reminder.remindAt) ?? new Date(),
        createdAt: timestampToDate(reminder.createdAt) ?? new Date(),
      })),
      attachments: task.attachments.map((attachment) => ({
        id: attachment.id,
        taskId: attachment.taskId,
        name: attachment.name,
        url: attachment.url,
        mimeType: attachment.mimeType,
        size: attachment.size,
        createdAt: timestampToDate(attachment.createdAt) ?? new Date(),
      })),
      subtasks: task.subtasks.map((subtask) => ({
        id: subtask.id,
        taskId: subtask.taskId,
        title: subtask.title,
        completed: Boolean(subtask.completed),
        position: subtask.position,
        createdAt: timestampToDate(subtask.createdAt) ?? new Date(),
        updatedAt: timestampToDate(subtask.updatedAt) ?? new Date(),
      })),
      changeLogs: task.changeLogs.map((log) => ({
        id: log.id,
        taskId: log.taskId,
        field: log.field,
        previousValue: log.previousValue,
        newValue: log.newValue,
        description: log.description,
        actor: log.actor,
        createdAt: timestampToDate(log.createdAt) ?? new Date(),
      })),
    };

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: TaskParams) {
  try {
    const taskId = params.taskId;
    const payload = await request.json();
    const existing = await getTask(taskId);

    if (!existing) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const updates: Record<string, any> = {};
    const changeLogEntries: Array<{
      field: string | null;
      previousValue: string | null;
      newValue: string | null;
      description: string;
    }> = [];

    const fieldsToCompare: Record<string, { current: any; incoming: any; formatter?: (value: any) => any }> = {
      title: { current: existing.title, incoming: payload.title },
      description: { current: existing.description, incoming: payload.description ?? null },
      listId: { current: existing.listId, incoming: payload.listId },
      priority: { current: existing.priority, incoming: payload.priority },
      completed: { current: existing.completed, incoming: payload.completed },
      estimatedMinutes: { current: existing.estimatedMinutes, incoming: payload.estimatedMinutes ?? null },
      actualMinutes: { current: existing.actualMinutes, incoming: payload.actualMinutes ?? null },
    };

    if (payload.scheduleDate !== undefined) {
      fieldsToCompare.scheduleDate = {
        current: existing.scheduleDate ? existing.scheduleDate.toISOString() : null,
        incoming: payload.scheduleDate ? new Date(payload.scheduleDate).toISOString() : null,
      };
    }

    if (payload.deadline !== undefined) {
      fieldsToCompare.deadline = {
        current: existing.deadline ? existing.deadline.toISOString() : null,
        incoming: payload.deadline ? new Date(payload.deadline).toISOString() : null,
      };
    }

    if (payload.recurrence !== undefined) {
      fieldsToCompare.recurrence = {
        current: existing.recurrence ? JSON.stringify(existing.recurrence) : null,
        incoming: payload.recurrence ? JSON.stringify(payload.recurrence) : null,
      };
    }

    for (const [field, { current, incoming }] of Object.entries(fieldsToCompare)) {
      if (incoming !== undefined && incoming !== current) {
        if (field === "scheduleDate" || field === "deadline") {
          updates[field] = incoming ? dateToUnix(new Date(incoming)) : null;
        } else if (field === "recurrence") {
          updates[field] = incoming;
        } else if (field === "completed" && incoming === true) {
          updates.completedAt = dateToUnix(new Date());
          updates.completed = true;
        } else if (field === "completed" && incoming === false) {
          updates.completedAt = null;
          updates.completed = false;
        } else {
          updates[field] = incoming;
        }

        changeLogEntries.push({
          field,
          previousValue: current !== null && current !== undefined ? String(current) : null,
          newValue: incoming !== null && incoming !== undefined ? String(incoming) : null,
          description: `${field} updated`,
        });
      }
    }

    // Update task
    if (Object.keys(updates).length > 0) {
      db.update(tasks)
        .set(updates)
        .where(eq(tasks.id, taskId))
        .run();
    }

    // Update labels
    if (payload.labelIds) {
      const existingLabelIds = existing.labels.map((entry) => entry.label.id);
      const newLabelIds: string[] = payload.labelIds;

      const labelsToAdd = newLabelIds.filter((id) => !existingLabelIds.includes(id));
      const labelsToRemove = existingLabelIds.filter((id) => !newLabelIds.includes(id));

      if (labelsToAdd.length > 0) {
        db.insert(taskLabels)
          .values(labelsToAdd.map((labelId) => ({ taskId, labelId })))
          .run();
        changeLogEntries.push({
          field: "labels",
          previousValue: existingLabelIds.join(","),
          newValue: newLabelIds.join(","),
          description: "Labels updated",
        });
      }

      if (labelsToRemove.length > 0) {
        db.delete(taskLabels)
          .where(eq(taskLabels.taskId, taskId))
          .where(notInArray(taskLabels.labelId, labelsToAdd))
          .run();
      }
    }

    // Update reminders
    if (payload.reminders) {
      db.delete(reminders)
        .where(eq(reminders.taskId, taskId))
        .run();

      db.insert(reminders)
        .values(
          payload.reminders.map((reminder: { remindAt: string }) => ({
            id: nanoid(),
            taskId,
            remindAt: dateToUnix(new Date(reminder.remindAt))!,
          }))
        )
        .run();

      changeLogEntries.push({
        field: "reminders",
        previousValue: existing.reminders.map((r) => r.remindAt.toISOString()).join(","),
        newValue: payload.reminders.map((r: { remindAt: string }) => r.remindAt).join(","),
        description: "Reminders updated",
      });
    }

    // Update subtasks
    if (payload.subtasks) {
      db.delete(subtasks)
        .where(eq(subtasks.taskId, taskId))
        .run();

      db.insert(subtasks)
        .values(
          payload.subtasks.map(
            (
              subtask: { id?: string; title: string; completed?: boolean; position?: number },
              index: number
            ) => ({
              id: subtask.id ?? nanoid(),
              taskId,
              title: subtask.title,
              completed: subtask.completed ? 1 : 0,
              position: subtask.position ?? index,
            })
          )
        )
        .run();

      changeLogEntries.push({
        field: "subtasks",
        previousValue: existing.subtasks.map((s) => s.title).join(","),
        newValue: payload.subtasks.map((s: { title: string }) => s.title).join(","),
        description: "Subtasks updated",
      });
    }

    // Log changes
    if (changeLogEntries.length > 0) {
      db.insert(changeLogs)
        .values(
          changeLogEntries.map((entry) => ({
            id: nanoid(),
            taskId,
            field: entry.field,
            previousValue: entry.previousValue,
            newValue: entry.newValue,
            description: entry.description,
            actor: "user",
          }))
        )
        .run();
    }

    const updatedTask = await getTask(taskId);

    return NextResponse.json(
      updatedTask ? {
        ...mapTask(updatedTask),
        recurrence: serializeRecurrence(updatedTask.recurrence ?? null),
      } : null
    );
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: TaskParams) {
  try {
    const taskId = params.taskId;

    const existing = await getTask(taskId);
    if (!existing) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    db.delete(tasks)
      .where(eq(tasks.id, taskId))
      .run();

    db.insert(changeLogs)
      .values({
        id: nanoid(),
        taskId,
        field: null,
        previousValue: null,
        newValue: null,
        description: "Task deleted",
        actor: "user",
      })
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
