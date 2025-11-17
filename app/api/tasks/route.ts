import { NextRequest, NextResponse } from "next/server";
import { db, initializeDefaultList } from "@/lib/db";
import { tasks, subtasks, reminders, taskLabels, changeLogs } from "@/lib/db/schema";
import { nanoid } from "@/lib/utils";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { mapTask, timestampToDate, dateToUnix } from "@/lib/db/utils";
import { startOfDay, endOfDay, addDays, parseISO } from "date-fns";

type TaskFields = {
  scheduleDate: number | null;
  deadline: number | null;
  completed: number;
  listId: string;
};

// Initialize default list on first access
initializeDefaultList();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get("view");
    const listId = searchParams.get("listId");
    const includeCompleted = searchParams.get("includeCompleted") === "true";

    type TaskQueryResult = Awaited<ReturnType<typeof db.query.tasks.findMany>>;
    let tasksList: TaskQueryResult;

    if (listId) {
      // Get tasks for a specific list
      tasksList = await db.query.tasks.findMany({
        where: (fields) => {
          const conditions = [eq(fields.listId, listId)];
          if (!includeCompleted) {
            conditions.push(eq(fields.completed, false));
          }
          return and(...conditions);
        },
        with: {
          list: true,
          labels: {
            with: {
              label: true,
            },
          },
          subtasks: {
            orderBy: (fields) => [fields.position],
          },
          reminders: true,
        },
        orderBy: (fields) => [desc(fields.createdAt)],
      });
    } else if (view) {
      const now = new Date();
      const startToday = startOfDay(now);
      const endToday = endOfDay(now);
      const end7Days = endOfDay(addDays(now, 7));

      let whereConditions;

      switch (view) {
        case "today":
          whereConditions = (fields: TaskFields) => {
            const conditions = [
              gte(fields.scheduleDate, dateToUnix(startToday)!),
              lte(fields.scheduleDate, dateToUnix(endToday)!),
            ];
            if (!includeCompleted) {
              conditions.push(eq(fields.completed, false));
            }
            return and(...conditions);
          };
          break;
        case "next7days":
          whereConditions = (fields: TaskFields) => {
            const conditions = [
              gte(fields.scheduleDate, dateToUnix(startToday)!),
              lte(fields.scheduleDate, dateToUnix(end7Days)!),
            ];
            if (!includeCompleted) {
              conditions.push(eq(fields.completed, false));
            }
            return and(...conditions);
          };
          break;
        case "upcoming":
          whereConditions = (fields: TaskFields) => {
            const conditions = [gte(fields.scheduleDate, dateToUnix(startToday)!)];
            if (!includeCompleted) {
              conditions.push(eq(fields.completed, false));
            }
            return and(...conditions);
          };
          break;
        case "all":
        default:
          whereConditions = (fields: TaskFields) => {
            if (!includeCompleted) {
              return eq(fields.completed, false);
            }
            return undefined;
          };
          break;
      }

      tasksList = await db.query.tasks.findMany({
        where: whereConditions,
        with: {
          list: true,
          labels: {
            with: {
              label: true,
            },
          },
          subtasks: {
            orderBy: (fields) => [fields.position],
          },
          reminders: true,
        },
        orderBy: (fields) => [fields.scheduleDate, desc(fields.createdAt)],
      });
    } else {
      // Get all tasks
      tasksList = await db.query.tasks.findMany({
        where: includeCompleted ? undefined : (fields) => eq(fields.completed, false),
        with: {
          list: true,
          labels: {
            with: {
              label: true,
            },
          },
          subtasks: {
            orderBy: (fields) => [fields.position],
          },
          reminders: true,
        },
        orderBy: (fields) => [desc(fields.createdAt)],
      });
    }

    type TaskQueryRow = TaskQueryResult[0];
    type LabelEntry = { label: { id: string; name: string; color: string; icon: string; createdAt: number; updatedAt: number } };
    type SubtaskRow = { id: string; taskId: string; title: string; completed: number; position: number; createdAt: number; updatedAt: number };
    type ReminderRow = { id: string; taskId: string; remindAt: number; createdAt: number };

    const mappedTasks = tasksList.map((task: TaskQueryRow) => ({
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
      labels: task.labels.map((entry: LabelEntry) => ({
        id: entry.label.id,
        name: entry.label.name,
        color: entry.label.color,
        icon: entry.label.icon,
        createdAt: timestampToDate(entry.label.createdAt) ?? new Date(),
        updatedAt: timestampToDate(entry.label.updatedAt) ?? new Date(),
      })),
      subtasks: task.subtasks.map((subtask: SubtaskRow) => ({
        id: subtask.id,
        taskId: subtask.taskId,
        title: subtask.title,
        completed: Boolean(subtask.completed),
        position: subtask.position,
        createdAt: timestampToDate(subtask.createdAt) ?? new Date(),
        updatedAt: timestampToDate(subtask.updatedAt) ?? new Date(),
      })),
      reminders: task.reminders.map((reminder: ReminderRow) => ({
        id: reminder.id,
        taskId: reminder.taskId,
        remindAt: timestampToDate(reminder.remindAt) ?? new Date(),
        createdAt: timestampToDate(reminder.createdAt) ?? new Date(),
      })),
    }));

    return NextResponse.json(mappedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      listId,
      title,
      description,
      scheduleDate,
      deadline,
      estimatedMinutes,
      priority = "none",
      recurrence,
      labelIds = [],
      subtaskTitles = [],
      reminderDates = [],
    } = body;

    if (!listId || !title) {
      return NextResponse.json(
        { error: "listId and title are required" },
        { status: 400 }
      );
    }

    const taskId = nanoid();

    // Insert task
    db.insert(tasks)
      .values({
        id: taskId,
        listId,
        title,
        description: description || null,
        scheduleDate: scheduleDate ? dateToUnix(parseISO(scheduleDate)) : null,
        deadline: deadline ? dateToUnix(parseISO(deadline)) : null,
        estimatedMinutes: estimatedMinutes || null,
        priority,
        recurrence: recurrence ? JSON.stringify(recurrence) : null,
        completed: false,
      } as typeof tasks.$inferInsert)
      .run();

    // Insert labels
    if (labelIds.length > 0) {
      db.insert(taskLabels)
        .values(
          labelIds.map((labelId: string) => ({
            taskId,
            labelId,
          })) as typeof taskLabels.$inferInsert[]
        )
        .run();
    }

    // Insert subtasks
    if (subtaskTitles.length > 0) {
      db.insert(subtasks)
        .values(
          subtaskTitles.map((subtaskTitle: string, index: number) => ({
            id: nanoid(),
            taskId,
            title: subtaskTitle,
            completed: false,
            position: index,
          })) as typeof subtasks.$inferInsert[]
        )
        .run();
    }

    // Insert reminders
    if (reminderDates.length > 0) {
      db.insert(reminders)
        .values(
          reminderDates.map((reminderDate: string) => ({
            id: nanoid(),
            taskId,
            remindAt: dateToUnix(parseISO(reminderDate))!,
          })) as typeof reminders.$inferInsert[]
        )
        .run();
    }

    // Log creation
    db.insert(changeLogs)
      .values({
        id: nanoid(),
        taskId,
        field: null,
        previousValue: null,
        newValue: null,
        description: "Task created",
        actor: "user",
      } as typeof changeLogs.$inferInsert)
      .run();

    return NextResponse.json({ id: taskId }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
