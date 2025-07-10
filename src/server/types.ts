// Shared types for server-side code
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface UserCreateRequest {
  name: string;
  email: string;
}

export interface DatabaseUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}
