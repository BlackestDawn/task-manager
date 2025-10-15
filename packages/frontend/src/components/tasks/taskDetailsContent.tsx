'use client';
import { useState } from "react";
import Link from "next/link";
import type { Task, Group } from "@task-manager/common";
import { isTaskOverdue } from "@task-manager/common";
import { ArrowLeft, CheckSquare, Calendar, Clock, Users, AlertTriangle } from "lucide-react";
import TaskBasicInfoSection from "@/components/tasks/taskBasicInfoSection";
import TaskStatusSection from "@/components/tasks/taskStatusSection";
import TaskGroupsSection from "@/components/tasks/taskGroupsSection";
import { Can } from "@/components/auth/can";

interface TaskDetailsContentProps {
  task: Task;
  groups: Group[];
}

export default function TaskDetailsContent({ task, groups }: TaskDetailsContentProps) {
  const [editingSection, setEditingSection] = useState<"basic" | "status" | null>(null);

  const isOverdue = isTaskOverdue(task);

  const getStatusBadge = () => {
    if (task.completed) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckSquare className="h-4 w-4 mr-1" />
          Completed
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <Clock className="h-4 w-4 mr-1" />
        In Progress
      </span>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/tasks"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Tasks
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className={`text-3xl font-bold ${task.completed ? "text-gray-500 line-through" : "text-gray-900 dark:text-white"}`}>
              {task.title}
            </h1>
            {task.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {task.description}
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Task Information
          </h3>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <CheckSquare className="h-4 w-4 mr-2" />
                Status
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {task.completed ? "Completed" : "In Progress"}
                {task.completedAt && (
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    (Completed on {new Date(task.completedAt).toLocaleDateString()})
                  </span>
                )}
              </dd>
            </div>

            {task.finishBy && (
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Due Date
                </dt>
                <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 ${isOverdue && !task.completed ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-900 dark:text-white"}`}>
                  {new Date(task.finishBy).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {isOverdue && !task.completed && (
                    <span className="ml-2">(Overdue)</span>
                  )}
                </dd>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Groups
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {groups.length} group{groups.length !== 1 ? 's' : ''}
              </dd>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Created
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {new Date(task.createdAt).toLocaleDateString('en-US', {
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
        <Can I="update" a={task}>
          <TaskBasicInfoSection
            task={task}
            isEditing={editingSection === 'basic'}
            onEdit={() => setEditingSection('basic')}
            onCancel={() => setEditingSection(null)}
            onSuccess={() => setEditingSection(null)}
          />
        </Can>

        <Can I="update" a={task} field="completed">
          <TaskStatusSection
            task={task}
            isEditing={editingSection === 'status'}
            onEdit={() => setEditingSection('status')}
            onCancel={() => setEditingSection(null)}
            onSuccess={() => setEditingSection(null)}
          />
        </Can>

        <TaskGroupsSection
          groups={groups}
        />
      </div>
    </div>
  );
}