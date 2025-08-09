import { eq, sql, or, inArray } from "drizzle-orm";
import { type DBConn } from "../../config";
import type { CreateTaskRequest, UpdateTaskRequest, DoByUUIDRequest } from "@task-manager/common";
import { tasks, taskGroups, groups, userGroups } from "../schema";

export async function getGroupsForTask(db: DBConn, params: DoByUUIDRequest) {
  const result = await db.select({
    id: taskGroups.groupId,
  }).from(groups)
    .where(inArray(
      groups.id,
      db.select({
        groupId: taskGroups.groupId,
      }).from(taskGroups).where(eq(taskGroups.taskId, params.id))
    ));
  return result;
}

export async function createTask(db: DBConn, params: CreateTaskRequest) {
  const [result] = await db.insert(tasks).values(params).returning();
  return {
    __typename: 'Task',
    ...result,
    groups: [],
  };
}

export async function updateTask(db: DBConn, params: UpdateTaskRequest) {
  const [result] = await db.update(tasks).set(params).where(eq(tasks.id, params.id)).returning();
  if (!result) return null;
  const groups = await getGroupsForTask(db, params);

  return {
    __typename: 'Task',
    ...result,
    groups,
  };
}

export async function deleteTask(db: DBConn, params: DoByUUIDRequest) {
  await db.delete(tasks).where(eq(tasks.id, params.id)).returning();
}

export async function getAllTasks(db: DBConn) {
  const taskRows = await db.select().from(tasks);
  const result = await Promise.all(
    taskRows.map(async (task) => {
      const groups = await getGroupsForTask(db, { id: task.id });

      return {
        __typename: 'Task',
        ...task,
        groups: groups,
      };
    })
  );

  return result;
}

export async function getTaskById(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.select().from(tasks).where(eq(tasks.id, params.id));
  const groups = await db.select(
    {
      id: taskGroups.groupId,
    }
  ).from(taskGroups).where(eq(taskGroups.taskId, params.id));

  return {
    __typename: 'Task',
    ...result,
    groups: groups,
  };
}

export async function markDone(db: DBConn, params: DoByUUIDRequest) {
  const [result] = await db.update(tasks).set({
    completed: true,
    completedAt: sql`now()`,
  }).where(eq(tasks.id, params.id)).returning();
  const groups = await getGroupsForTask(db, params);
  return {
    __typename: 'Task',
    ...result,
    groups,
  };
}

export async function getTasksByUserId(db: DBConn, params: DoByUUIDRequest) {
  const result = await db.select().from(tasks).where(eq(tasks.userId, params.id));
  const groups = await getGroupsForTask(db, params);
  return {
    __typename: 'Task',
    ...result,
    groups,
  };
}

export async function getAllTasksForUser(db: DBConn, params: DoByUUIDRequest) {
  const taskRows = await db.selectDistinctOn([tasks.id]).from(tasks)
    .where(or(
      eq(tasks.userId, params.id),
      inArray(tasks.id,
      db.select({
        taskId: taskGroups.taskId,
      }).from(taskGroups)
        .where(inArray(
          taskGroups.groupId,
          db.select({
            groupId: userGroups.groupId,
          }).from(userGroups).where(eq(userGroups.userId, params.id))
        ))
    )
  ));
  const result = await Promise.all(
    taskRows.map(async (task) => {
      const groups = await getGroupsForTask(db, { id: task.id });

      return {
        __typename: 'Task',
        ...task,
        groups: groups,
      };
    })
  );
  return result;
}
