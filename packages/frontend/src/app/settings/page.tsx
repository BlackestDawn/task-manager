import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/protectedRoute";

export const metadata: Metadata = {
  title: 'Task Manager - Settings',
  description: 'Settings page',
};

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div>
        <h2>Settings Page</h2>
        <p>This is where your settings vill reside</p>
      </div>
    </ProtectedRoute>
  );
}
