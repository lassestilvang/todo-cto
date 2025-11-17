import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const lists = sqliteTable("lists", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  isDefault: integer("is_default", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const labels = sqliteTable("labels", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey().notNull(),
  listId: text("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  scheduleDate: integer("schedule_date"),
  deadline: integer("deadline"),
  estimatedMinutes: integer("estimated_minutes"),
  actualMinutes: integer("actual_minutes"),
  priority: text("priority")
    .notNull()
    .default("none"),
  recurrence: text("recurrence"),
  completed: integer("completed", { mode: "boolean" })
    .notNull()
    .default(false),
  completedAt: integer("completed_at"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const taskLabels = sqliteTable(
  "task_labels",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.taskId, table.labelId] }),
  })
);

export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey().notNull(),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  remindAt: integer("remind_at").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const subtasks = sqliteTable("subtasks", {
  id: text("id").primaryKey().notNull(),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" })
    .notNull()
    .default(false),
  position: integer("position").notNull().default(0),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const attachments = sqliteTable("attachments", {
  id: text("id").primaryKey().notNull(),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(unixepoch())`),
});

export const changeLogs = sqliteTable(
  "change_logs",
  {
    id: text("id").primaryKey().notNull(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    field: text("field"),
    previousValue: text("previous_value"),
    newValue: text("new_value"),
    description: text("description").notNull(),
    actor: text("actor").notNull().default("system"),
    createdAt: integer("created_at")
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    taskIndex: uniqueIndex("change_logs_task_created_at_idx").on(
      table.taskId,
      table.createdAt
    ),
  })
);

export const listRelations = relations(lists, ({ many }) => ({
  tasks: many(tasks),
}));

export const labelRelations = relations(labels, ({ many }) => ({
  taskLabels: many(taskLabels),
}));

export const taskRelations = relations(tasks, ({ one, many }) => ({
  list: one(lists, {
    fields: [tasks.listId],
    references: [lists.id],
  }),
  labels: many(taskLabels),
  reminders: many(reminders),
  attachments: many(attachments),
  subtasks: many(subtasks),
  changeLogs: many(changeLogs),
}));

export const taskLabelRelations = relations(taskLabels, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLabels.taskId],
    references: [tasks.id],
  }),
  label: one(labels, {
    fields: [taskLabels.labelId],
    references: [labels.id],
  }),
}));

export const reminderRelations = relations(reminders, ({ one }) => ({
  task: one(tasks, {
    fields: [reminders.taskId],
    references: [tasks.id],
  }),
}));

export const subtaskRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
}));

export const attachmentRelations = relations(attachments, ({ one }) => ({
  task: one(tasks, {
    fields: [attachments.taskId],
    references: [tasks.id],
  }),
}));

export const changeLogRelations = relations(changeLogs, ({ one }) => ({
  task: one(tasks, {
    fields: [changeLogs.taskId],
    references: [tasks.id],
  }),
}));
