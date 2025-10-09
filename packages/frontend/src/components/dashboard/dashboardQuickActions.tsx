'use client';
import React, { useState, useOptimistic } from "react";
import { useTasks } from "@/lib/api/tasks/queries";
import { toggleTaskCompletionAction } from "@/lib/actions/tasks";
import { sortTasksByFinishDate } from "@task-manager/common";
import DashboardSkeleton from "./dashboardSkeleton";
import { Alert } from "@mui/joy";
import { RefreshCw } from "lucide-react";

export default function DashboardQuickActions() {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { data: tasks, isLoading, error, refetch } = useTasks();

  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(
    tasks || [],
    (state, taskId: string) => {
      return state.map(task => task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
      );
    }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkTaskDone = async (taskId: string) => {
    updateOptimisticTasks(taskId);

    const result = await toggleTaskCompletionAction(taskId);

    if (result.success && result.data) {
      await refetch();
    } else if (!result.success) {
      console.error("Failed to toggle task completion:", result.error);
      await refetch();
    }
  };

  if (isLoading && !tasks) return <DashboardSkeleton />;

  if (error && !tasks) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert color="danger" className="mb-4">
          Failed to load tasks: {error.message}
        </Alert>
        <DashboardSkeleton />
      </div>
    );
  }

  if (optimisticTasks.length > 0 || tasks) {
    const displayTasks = optimisticTasks.length > 0 ? optimisticTasks : (tasks || []);

    return (
      <div className="relative">
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2">
              {displayTasks
                .filter(task => !task.completed && task.finishBy)
                .sort(sortTasksByFinishDate)
                .slice(0, 3)
                .map(task => (
                  <form
                    key={task.id}
                    action={async () => {
                      await handleMarkTaskDone(task.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-sm rounded-full transition-colors"
                    >
                      ✓ {task.title}
                    </button>
                  </form>
                ))}
            </div>
          </div>
        </div>

        {/* <DashboardServerComponent tasks={displayTasks} /> */}
      </div>
    );
  }

  return <DashboardSkeleton />;
}
