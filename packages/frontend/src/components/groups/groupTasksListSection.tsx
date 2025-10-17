'use client';
import { useEffect, useState, useTransition } from "react";
import type { Group, Task } from "@task-manager/common";
import { removeTaskFromGroupAction, assignTaskToGroupAction } from "@/lib/actions/groups";
import { getTasksAction } from "@/lib/actions/tasks";
import { CheckSquare, Square, Calendar, Minus, Edit, X, Plus } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/components/auth/clientAuthProvider";
import { useGroupPermissions } from "@/hooks/useGroupPermissions";
import TaskStatusBadge from "@/components/tasks/taskStatusBadge";

interface GroupTasksListSectionProps {
  group: Group;
  tasks: Task[];
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function GroupTasksListSection({ group, tasks, isEditing, onEdit, onCancel, onSuccess }: GroupTasksListSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [removingTaskId, setRemovingTaskId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const { user: currentUser } = useAuthContext();
  const { canAssignTaskToGroup, canRemoveTaskFromGroup } = useGroupPermissions();

  const canAddTasks = canAssignTaskToGroup(group);
  const canRemoveTasks = canRemoveTaskFromGroup(group);
  const canManageTasks = canAddTasks && canRemoveTasks;

  const availableTasks = allTasks.filter(
    task => !tasks.some(t => t.id === task.id)
  );

  useEffect(() => {
    if (isEditing && allTasks.length === 0) {
      setLoadingTasks(true);
      getTasksAction().then(tasks => {
        setAllTasks(tasks);
        setLoadingTasks(false);
      }).catch(() => {
        setLoadingTasks(false);
        setError("Failed to load tasks");
      });
    }
  }, [isEditing, allTasks.length]);

  const handleRemoveTask = (taskId: string) => {
    setRemovingTaskId(taskId);
    setError(null);

    startTransition(async () => {
      const result = await removeTaskFromGroupAction(group.id, { taskId });
      if (result.success) {
        setRemovingTaskId(null);
        onSuccess();
      } else {
        setError(result.error || "Failed to remove task");
        setRemovingTaskId(null);
      }
    });
  };

  const handleAssignTask = () => {
    if (!selectedTaskId) {
      setError("Please select a task to assign");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await assignTaskToGroupAction(group.id, {
        taskId: selectedTaskId,
        assignedBy: currentUser!.id,
      });

      if (result.success) {
        setSelectedTaskId("");
        setShowAddForm(false);
        window.location.reload();
      } else {
        setError(result.error || "Failed to assign task");
      }
    });
  };

  if (isEditing && canManageTasks) {
    return (
      <div className="px-4 py-5 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage tasks assigned to this group. Assign new tasks or remove existing ones.
          </p>
          <button
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <X className="h-4 w-4 mr-2" />
            Done
          </button>
        </div>

        {canAddTasks && availableTasks.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                disabled={isPending || loadingTasks}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Assign Task
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assign task to group
                  </label>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedTaskId("");
                      setError(null);
                    }}
                    disabled={isPending}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label htmlFor="task-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Task
                  </label>
                  <select
                    id="task-select"
                    value={selectedTaskId || ""}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    disabled={isPending || loadingTasks}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  >
                    <option value="">Select a task...</option>
                    {availableTasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title} {task.completed ? '(Completed)' : task.finishBy ? `(Due: ${new Date(task.finishBy).toLocaleDateString()})` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Only your accessible tasks are shown
                  </p>
                </div>

                <button
                  onClick={handleAssignTask}
                  disabled={isPending || !selectedTaskId || loadingTasks}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isPending ? "Assigning..." : "Assign to Group"}
                </button>
              </div>
            )}
          </div>
        )}

        {canAddTasks && availableTasks.length === 0 && !loadingTasks && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              All your accessible tasks are already assigned to this group.
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Current Tasks ({tasks.length})
          </h4>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <li key={task.id} className="py-4 flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {task.completed ? (
                      <CheckSquare className="h-5 w-5 text-green-500" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {task.finishBy && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(task.finishBy).toLocaleDateString()}
                        </span>
                      )}
                      <TaskStatusBadge task={task} />
                    </div>
                  </div>
                </div>
                {canRemoveTasks && (
                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    disabled={isPending || removingTaskId === task.id}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    {removingTaskId === task.id ? "Removing..." : "Remove"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 sm:p-6">
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No tasks assigned to this group yet
          </p>
          {canAddTasks && (
            <button
              onClick={onEdit}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Tasks
            </button>
          )}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <li key={task.id} className="py-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {task.completed ? (
                      <CheckSquare className="h-5 w-5 text-green-500" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <Link
                      href={`/tasks/${task.id}`}
                      className={`text-sm font-medium hover:underline ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"}`}
                    >
                      {task.title}
                    </Link>
                    {task.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {task.finishBy && (
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(task.finishBy).toLocaleDateString()}
                        </span>
                      )}
                      <TaskStatusBadge task={task} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {canManageTasks && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={onEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Tasks
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
