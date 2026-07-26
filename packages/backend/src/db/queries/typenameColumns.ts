import { sql } from "drizzle-orm";

// Reusable literal-column fragments so queries can select __typename
// directly from Postgres instead of every call site re-adding it in JS.
export const taskTypename = sql<'Task'>`'Task'`.as('__typename');
export const userTypename = sql<'User'>`'User'`.as('__typename');
export const groupTypename = sql<'Group'>`'Group'`.as('__typename');
