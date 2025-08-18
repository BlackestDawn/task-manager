import type { User } from "@task-manager/common";
import { testUsers } from "../data/mockData";

export async function fetchUsers(): Promise<User[]> {
  // const response = await fetch(API_USERS_ENDPOINT);
  // if (!response.ok) {
  //   throw new Error('Failed to fetch users');
  // }
  // return response.json();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(testUsers);
    }, 1000); // Simulate network delay
  });
}

export async function fetchUserById(id: string): Promise<User | null> {
  // const response = await fetch(`${API_USERS_ENDPOINT}/${id}`);
  // if (!response.ok) {
  //   return null;
  // }
  // return response.json();
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = testUsers.find(user => user.id === id);
      resolve(user || null);
    }, 1000); // Simulate network delay
  });
}
