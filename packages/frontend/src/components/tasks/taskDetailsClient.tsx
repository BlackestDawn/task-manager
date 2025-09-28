'use client';
import React from "react";
import { useTask } from "@/lib/api/tasks/queries";
import TaskDetails from "./taskDetails";
import { CircularProgress, Alert } from "@mui/joy";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TaskDetailsClientProps {
  taskId: string;
}

export default function TaskDetailsClient({ taskId }: TaskDetailsClientProps) {
  const { data: task, isLoading, error } = useTask(taskId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert color="danger" className="mb-4">
          Failed to load task: {error.message}
        </Alert>
        <div className="text-center">
          <Link
            href="/tasks"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Task not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The task you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>
          <Link
            href="/tasks"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/tasks"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Tasks
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Task Details
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage your task
        </p>
      </div>

      {/* Task Details */}
      <TaskDetails task={task} />
    </div>
  );
}
