import TaskDetails from "@/components/pages/tasks/taskDetails";
import type { Metadata } from "next";
import { fetchTaskById } from "@/lib/api/task";
import { Suspense } from "react";
import type { TaskItem } from "@task-manager/common";
import type { IDParamProp } from "@/lib/data/interfaces/general";
import type { TaskProp } from "@/lib/data/interfaces/task";

export const metadata: Metadata = {
  title: 'Task Manager - Task Details',
  description: 'Viewing details of a specific task.',
};

export default async function TaskPageWrapper({ params }: IDParamProp) {
  const task: TaskItem | null = await fetchTaskById(params.id);

  return (
    <Suspense fallback={<div>Fetching task details...</div>}>
      <TaskPage task={task} />
    </Suspense>
  );
}

function TaskPage({ task }: TaskProp) {
  if (!task) {
    return <div>Task not found.</div>;
  }

  return (
    <div>
      <h2>Task Details</h2>
      <TaskDetails task={task} />
    </div>
  );
}
