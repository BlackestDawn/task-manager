import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Task Manager - Settings',
  description: 'Settings page',
};

export default function SettingsPage() {
  return (
    <div>
      <h2>Settings Page</h2>
      <p>This is where your settings vill reside</p>
    </div>
  );
}
