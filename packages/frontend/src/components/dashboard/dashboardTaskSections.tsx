import type { Task } from "@task-manager/common";
import TaskSectionCard from "./taskSectionCard";
import { Star, Calendar, CalendarDays, Clock, AlertTriangle } from "lucide-react";

interface DashboardTaskSectionsProps {
  nextTask: Task | undefined;
  tasksForThisWeek: Task[];
  tasksForThisMonth: Task[];
  nonTimeboundTasks: Task[];
  overdueTasks: Task[];
}

export default function DashboardTaskSections({
  nextTask,
  tasksForThisWeek,
  tasksForThisMonth,
  nonTimeboundTasks,
  overdueTasks,
}: DashboardTaskSectionsProps) {
  return (
    <div className="space-y-8">
      {/* Next Task to Work On */}
      {nextTask && (
        <TaskSectionCard
          title="Recommended Next Task"
          description="Based on priority and due dates"
          icon={Star}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100 dark:bg-yellow-900"
          tasks={[nextTask]}
          showAsGrid={false}
          variant="featured"
        />
      )}

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <TaskSectionCard
          title="Overdue Tasks"
          description={`${overdueTasks.length} task${overdueTasks.length !== 1 ? 's' : ''} past due date`}
          icon={AlertTriangle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100 dark:bg-red-900"
          tasks={overdueTasks}
          showAsGrid={true}
          variant="urgent"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* This Week */}
        <TaskSectionCard
          title="This Week"
          description={`${tasksForThisWeek.length} task${tasksForThisWeek.length !== 1 ? 's' : ''} due this week`}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100 dark:bg-blue-900"
          tasks={tasksForThisWeek}
          showAsGrid={true}
          variant="normal"
        />

        {/* This Month */}
        <TaskSectionCard
          title="This Month"
          description={`${tasksForThisMonth.length} task${tasksForThisMonth.length !== 1 ? 's' : ''} due this month`}
          icon={CalendarDays}
          iconColor="text-green-600"
          iconBgColor="bg-green-100 dark:bg-green-900"
          tasks={tasksForThisMonth}
          showAsGrid={true}
          variant="normal"
        />
      </div>

      {/* No Time Limit */}
      {nonTimeboundTasks.length > 0 && (
        <TaskSectionCard
          title="No Time Limit"
          description={`${nonTimeboundTasks.length} task${nonTimeboundTasks.length !== 1 ? 's' : ''} without deadlines`}
          icon={Clock}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100 dark:bg-gray-700"
          tasks={nonTimeboundTasks}
          showAsGrid={true}
          variant="normal"
        />
      )}
    </div>
  );
}
