import { useAuthContext } from "@/components/auth/clientAuthProvider";
import type { Task } from "@task-manager/common";
import { AbilityChecker } from "@task-manager/common";

export function useTaskPermissions() {
  const { ability } = useAuthContext();
  const abilities = new AbilityChecker({ ability });

  const canViewTask = (task?: Task) => abilities.canViewObject(task);

  const canCreateTasks = () => abilities.canCreateObject("Task");

  const canUpdateTask = (task?: Task) => abilities.canEditObject(task);

  const canDeleteTask = (task?: Task) => abilities.canDeleteObject(task);

  const canMarkDone = (task?: Task) => abilities.canEditObjectField(task, "completed");

  return {
    canViewTask,
    canCreateTasks,
    canUpdateTask,
    canDeleteTask,
    canMarkDone,
  };
}
