'use client';
import { useState } from "react";
import Link from "next/link";
import type { User, Task, Group } from "@task-manager/common";
import { ArrowLeft, User as userIcon, Mail, Calendar, Shield, ShieldOff, Crown, Settings, Briefcase, Users } from "lucide-react";
import UserBasicInfoSection from "./userBasicInfoSection";
import UserPasswordSection from "./userPasswordSection";
import UserStatusSection from "./userStatusSection";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { Can } from "@/components/auth/can";

interface UserDetailsContentProps {
  user: User;
  tasks: Task[];
  groups: Group[];
}

export default function UserDetailsContent({ user, tasks, groups }: UserDetailsContentProps) {
  const [editingSection, setEditingSection] = useState<"basic" | "password" | "status" | null>(null);
  const { user: currentUser } = useAuthContext();

  const isCurrentUser = currentUser?.id === user.id;

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case "admin": return <Crown className="h-3 w-3 mr-1" />;
      case "manager": return <Briefcase className="h-3 w-3 mr-1" />;
      default: return <Users className="h-3 w-3 mr-1" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/users"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Users
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              @{user.login}
            </p>
          </div>
          {isCurrentUser && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Crown className="h-4 w-4 mr-1" />
              You
            </span>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            User Information
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {user.email || <span className="text-gray-400 italic">No email provided</span>}
              </dd>
            </div>

            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Access Level
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getAccessLevelColor(user.accessLevel)}`}>
                  {getAccessLevelIcon(user.accessLevel)}
                  {user.accessLevel}
                </span>
              </dd>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                {user.disabled ? (
                  <ShieldOff className="h-4 w-4 mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Status
              </dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                {user.disabled ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Disabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                )}
              </dd>
            </div>

            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Tasks
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </dd>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Groups
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {user.groups.length} group{user.groups.length !== 1 ? 's' : ''}
              </dd>
            </div>

            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Member Since
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="space-y-6">
        <Can I="update" a={user}>
          <UserBasicInfoSection
            user={user}
            isEditing={editingSection === 'basic'}
            onEdit={() => setEditingSection('basic')}
            onCancel={() => setEditingSection(null)}
            onSuccess={() => setEditingSection(null)}
          />
        </Can>

        <Can I="update" a={user} field="password">
          <UserPasswordSection
            userId={user.id}
            isEditing={editingSection === 'password'}
            onEdit={() => setEditingSection('password')}
            onCancel={() => setEditingSection(null)}
            onSuccess={() => setEditingSection(null)}
          />
        </Can>

        <Can I="update" a={user} field="disabled">
          <UserStatusSection
            user={user}
            isEditing={editingSection === 'status'}
            onEdit={() => setEditingSection('status')}
            onCancel={() => setEditingSection(null)}
            onSuccess={() => setEditingSection(null)}
          />
        </Can>
      </div>
    </div>
  );
}