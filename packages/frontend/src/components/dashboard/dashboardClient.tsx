'use client';
import React from "react";
import { useTasks } from "@/lib/api/tasks/queries";
import { isThisMonth, isThisWeek, sortTasksByFinishDate} from "@task-manager/common";
import type { Task } from "@task-manager/common";
import DashboardStats from "./dashboardStats";
import DashboardTaskSections from "./dashboardTaskSections";
import DashboardSkeleton from "./dashboardSkeleton";
import {Alert} from "@mui/joy"

export default function DashboardClient() {
  const { data: tasks, isLoading, error } = useTasks();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert color="danger" className="mb-4">
          Failed to load tasks: {error.message}
        </Alert>
        <DashboardSkeleton />
      </div>
    );
  }

  const safeTasks = tasks || [];

  const tasksForThisWeek = safeTasks.filter(task => isThisWeek(task.finishBy || '')).sort(sortTasksByFinishDate);
  const tasksForThisMonth = safeTasks.filter(task => isThisMonth(task.finishBy || '')).sort(sortTasksByFinishDate);
  const nonTimeboundTasks = safeTasks.filter(task => !task.finishBy);
  const completedTasks = safeTasks.filter(task => task.completed);
  const overdueTasks = safeTasks.filter(task => !task.completed && task.finishBy && new Date(task.finishBy) < new Date());
  const nextTask: Task | undefined =
    safeTasks.filter(t => !t.completed && t.finishBy).sort(sortTasksByFinishDate)[0]
    || nonTimeboundTasks[0] || undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of your tasks and productivity
        </p>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        totalTasks={safeTasks.length}
        completedTasks={completedTasks.length}
        overdueTasks={overdueTasks.length}
        upcomingTasks={tasksForThisWeek.length}
      />

      {/* Task Sections */}
      <DashboardTaskSections
        nextTask={nextTask}
        tasksForThisWeek={tasksForThisWeek}
        tasksForThisMonth={tasksForThisMonth}
        nonTimeboundTasks={nonTimeboundTasks}
        overdueTasks={overdueTasks}
      />
    </div>
  );
}