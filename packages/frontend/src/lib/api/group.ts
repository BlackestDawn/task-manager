import type { Group } from "@task-manager/common";
import { testGroups } from "../data/mockData";

export async function fetchGroups(): Promise<Group[]> {
  // const response = await fetch(API_GROUPS_ENDPOINT);
  // if (!response.ok) {
  //   throw new Error('Failed to fetch groups');
  // }
  // return response.json();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(testGroups); // Assuming testUsers contains groups
    }, 1000); // Simulate network delay
  });
}

export async function fetchGroupById(id: string): Promise<Group | null> {
  // const response = await fetch(`${API_GROUPS_ENDPOINT}/${id}`);
  // if (!response.ok) {
  //   return null;
  // }
  // return response.json();
  return new Promise((resolve) => {
    setTimeout(() => {
      const group = testGroups.find(group => group.id === id); // Assuming testUsers contains groups
      resolve(group || null);
    }, 1000); // Simulate network delay
  });
}
