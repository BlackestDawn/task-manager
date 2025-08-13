import type { User, Group, TaskItem } from "@task-manager/common";

const baseTime = new Date();
const days = 24 * 60 * 60 * 1000; // milliseconds in a day
const hours = 60 * 60 * 1000;

export const testGroup1: Group = {
  __typename: "Group",
  id: "459de8c3-db5c-47a6-9c0a-9ff21a5b21ad",
  createdAt: new Date(baseTime.getTime() - 3 * hours),
  updatedAt: new Date(baseTime.getTime() - 2 * hours),
  name: "Test Group",
  description: "A group for testing purposes",
};

export const testGroup2: Group = {
  __typename: "Group",
  id: "b1c8f3d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
  createdAt: new Date(baseTime.getTime() - 5 * hours),
  updatedAt: new Date(baseTime.getTime() - 4 * hours),
  name: "Another Test Group",
  description: "Another group for testing purposes",
};

export const adminUser: User = {
  __typename: "User",
  id: "6f17ed88-f600-4a4c-b95d-b80d65afcb11",
  createdAt: new Date(baseTime.getTime() - 2 * hours),
  updatedAt: new Date(baseTime.getTime() - 1 * hours),
  login: "admin",
  name: "Admin User",
  email: "admin@localhost.localdomain",
  disabled: false,
  groups: [
    { id: testGroup1.id, role: "admin" },
    { id: testGroup2.id, role: "user" },
  ],
};

export const managerUser: User = {
  __typename: "User",
  id: "a2b3c4d5-e6f7-8a9b-0c1d2e3f4g5h",
  createdAt: new Date(baseTime.getTime() - 6 * hours),
  updatedAt: new Date(baseTime.getTime() - 5 * hours),
  login: "manager",
  name: "Manager User",
  email: "manager@localhost.localdomain",
  disabled: false,
  groups: [
    { id: testGroup1.id, role: "manager" },
    { id: testGroup2.id, role: "user" },
  ],
};

export const editoruser: User = {
  __typename: "User",
  id: "d1e2f3g4-h5i6-j7k8-l9m0-n1o2p3q4r5s6",
  createdAt: new Date(baseTime.getTime() - 8 * hours),
  updatedAt: new Date(baseTime.getTime() - 7 * hours),
  login: "editor",
  name: "Editor User",
  email: "editor@localhost.localdomain",
  disabled: false,
  groups: [
    { id: testGroup1.id, role: "editor" },
    { id: testGroup2.id, role: "user" },
  ],
};

export const normalUser: User = {
  __typename: "User",
  id: "12345678-90ab-cdef-1234-567890abcdef",
  createdAt: new Date(baseTime.getTime() - 12 * hours),
  updatedAt: new Date(baseTime.getTime() - 11 * hours),
  login: "normal",
  name: "Normal User",
  email: "normal@localhost.localdomain",
  disabled: false,
  groups: [
    { id: testGroup1.id, role: "user" },
    { id: testGroup2.id, role: "user" },
  ],
};

export const viewerUser: User = {
  __typename: "User",
  id: "f1g2h3i4-j5k6-l7m8-n9o0-p1q2r3s4t5u6",
  createdAt: new Date(baseTime.getTime() - 10 * hours),
  updatedAt: new Date(baseTime.getTime() - 9 * hours),
  login: "viewer",
  name: "Viewer User",
  email: "viewer@localhost.localdomain",
  disabled: false,
  groups: [
    { id: testGroup1.id, role: "viewer" },
    { id: testGroup2.id, role: "user" },
  ],
};

export const noneUser: User = {
  __typename: "User",
  id: "00000000-0000-0000-0000-000000000000",
  createdAt: new Date(baseTime.getTime() - 14 * hours),
  updatedAt: new Date(baseTime.getTime() - 13 * hours),
  login: "none",
  name: "No User",
  email: "none@localhost.localdomain",
  disabled: false,
  groups: [
    { id: testGroup1.id, role: "none" },
    { id: testGroup2.id, role: "user" },
  ],
};

export const testTask1: TaskItem = {
  __typename: "Task",
  id: "53522744-bfd1-44eb-b6b8-25a9b3d36cff",
  createdAt: new Date(baseTime.getTime() - 4 * hours),
  updatedAt: new Date(baseTime.getTime() - 3 * hours),
  title: "Test Task",
  description: "This is a task created for testing purposes.",
  finishBy: new Date(baseTime.getTime() + 10 * days),
  userId: managerUser.id,
  completed: false,
  completedAt: null,
  groups: [
    { id: testGroup1.id },
  ],
};

export const testTask2: TaskItem = {
  __typename: "Task",
  id: "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
  createdAt: new Date(baseTime.getTime() - 6 * hours),
  updatedAt: new Date(baseTime.getTime() - 5 * hours),
  title: "Another Test Task",
  description: "This is another task created for testing purposes.",
  finishBy: new Date(baseTime.getTime() + 3 * days),
  userId: editoruser.id,
  completed: true,
  completedAt: null,
  groups: [
    { id: testGroup2.id },
  ],
};

export const testTask3: TaskItem = {
  __typename: "Task",
  id: "c7d8e9f0-1a2b-3c4d-5e6f-7g8h9i0j1k2",
  createdAt: new Date(baseTime.getTime() - 8 * hours),
  updatedAt: new Date(baseTime.getTime() - 7 * hours),
  title: "Overdue Test Task",
  description: "This task is overdue and should be highlighted.",
  finishBy: new Date(baseTime.getTime() - 1 * days), // Overdue
  userId: normalUser.id,
  completed: false,
  completedAt: null,
  groups: [
    { id: testGroup1.id },
  ],
};

export const testGroups = [testGroup1, testGroup2];
export const testUsers = [adminUser, managerUser, editoruser, normalUser, viewerUser, noneUser];
export const testTasks = [testTask1, testTask2, testTask3];
const mockData = {
  users: testUsers,
  groups: testGroups,
  tasks: testTasks,
};

export default mockData;
