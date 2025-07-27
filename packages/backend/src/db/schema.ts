import { pgTable, timestamp, varchar, uuid, boolean, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { groupRoleList } from "@task-manager/common";

export const getCurrentDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000);
}

export const groupRoleEnum = pgEnum("group_role", groupRoleList);

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(getCurrentDate),
  title: varchar("title", { length: 256 }).notNull(),
  description: varchar("description", { length: 1024 }),
  finishBy: timestamp("finish_by"),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(getCurrentDate),
  login: varchar("login", { length: 256 }).notNull().unique(),
  name: varchar("name", { length: 256 }).notNull(),
  password: varchar("password", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }),
  disabled: boolean("disabled").default(false),
});

export const refresh_tokens = pgTable("refresh_tokens", {
  token: varchar("token", { length: 256 }).primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(getCurrentDate),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
});

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdateFn(getCurrentDate),
  name: varchar("name", { length: 256 }).notNull().unique(),
  description: varchar("description", { length: 1024 }),
  role: groupRoleEnum("role").notNull().default("user"),
});

export const userGroups = pgTable("user_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (table) => ([
  uniqueIndex("unique_user_group").on(table.userId, table.groupId),
]));

export const taskGroups = pgTable("task_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }).notNull(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  assignedBy: uuid("assigned_by").references(() => users.id, { onDelete: "set null" }),
}, (table) => ([
  uniqueIndex("unique_task_group").on(table.taskId, table.groupId),
]));
