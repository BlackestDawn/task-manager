'use client';
import { useState } from "react";
import { useGroupTasks, useRemoveTaskFromGroup } from "@/lib/api/groups/queries";
import { CheckSquare, Square, Calendar, User, Minus, Plus } from "lucide-react";
import LoadingSpinner from "@/components/general/loadingSpinner";

interface GroupTasksSectionProps {
  groupId: string;
  canAssignTask: boolean;
  canRemoveTask: boolean;
}

export default function GroupTasksSection({ groupId, canAssignTask, canRemoveTask }: GroupTasksSectionProps) {
  const { data: tasks = [], isLoading, error } = useGroupTasks(groupId);
  const [removingTaskId, setRemovingTaskId] = useState<string | null>(null);

  const removeTaskMutation = useRemoveTaskFromGroup();

  const handleRemoveTask = async (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to remove "${taskTitle}" from this group?`)) {
      setRemovingTaskId(taskId);
      try {
        await removeTaskMutation.mutateAsync({ groupId, taskId });
      } catch (error) {
        console.error('Failed to remove task:', error);
      } finally {
        setRemovingTaskId(null);
      }
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return null;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load group tasks. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canAssignTask && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Assign and manage tasks for this group
            </p>
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200">
              <Plus className="h-4 w-4 mr-2" />
              Assign Task
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {tasks.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <li key={task.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {task.completed ? (
                        <CheckSquare className="h-5 w-5 text-green-500" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-medium ${
                          task.completed
                            ? 'text-gray-500 dark:text-gray-400 line-through'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h4>
                        {task.completed && task.completedAt && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Completed
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className={`mt-1 text-sm ${
                          task.completed
                            ? 'text-gray-400 dark:text-gray-500'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {task.description}
                        </p>
                      )}

                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          <span>{task.userName}</span>
                        </div>

                        {task.finishBy && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className={`${
                              !task.completed && task.finishBy < new Date()
                                ? 'text-red-500 dark:text-red-400 font-medium'
                                : ''
                            }`}>
                              Due {formatDate(task.finishBy)}
                            </span>
                          </div>
                        )}

                        {task.completed && task.completedAt && (
                          <div className="flex items-center">
                            <CheckSquare className="h-3 w-3 mr-1" />
                            <span>Completed {formatDate(task.completedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {canRemoveTask && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleRemoveTask(task.id, task.title)}
                        disabled={removingTaskId === task.id}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from group"
                      >
                        {removingTaskId === task.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {canAssignTask
                ? "Assign tasks to get started."
                : "This group doesn't have any assigned tasks yet."}
            </p>
            {canAssignTask && (
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
