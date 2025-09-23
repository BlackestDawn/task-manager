"use client";
import { useAuthContext } from "./clientAuthProvider";

export default function AuthDebug() {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (process.env.PLATFORM !== "dev") return null;

  return (
    <div className="fixed top-0 right-0 bg-black text-white p-2 text-xs z-50 max-w-xs">
      <div>Auth State:</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>User: {user?.name || 'None'}</div>
      <div>Token: {typeof window !== 'undefined' && localStorage.getItem('auth_token') ? 'Present' : 'None'}</div>
      <div>Timestamp: {new Date().toLocaleTimeString()}</div>
    </div>
  );
}