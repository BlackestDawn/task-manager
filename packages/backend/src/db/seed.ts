import type { DBConn } from "../config";
import { getUsers, createUser } from "./queries/users";
import { hashPassword } from "../lib/auth/authentication";
import type { CreateUserRequest } from "@task-manager/common";

export async function seedInitialAdminUser(db: DBConn) {
  try {
    const users = await getUsers(db);
    if (users.length > 0) return;

    const adminUser: CreateUserRequest = {
      login: "admin",
      name: "Administrator",
      password: await hashPassword("admin123"),
      email: null,
      accessLevel: "admin",
    };

    await createUser(db, adminUser);
  } catch (error) {
    console.error("Error seeding initial admin user:", error);
  }
}
