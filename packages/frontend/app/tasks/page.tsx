import GetNextTaskToFinish from "@/components/pages/tasks/nextToFinish";
import TasksForThisWeek from "@/components/pages/tasks/tasksForThisWeek";
import TasksForThisMonth from "@/components/pages/tasks/tasksForThisMonth";
import { testTasks } from "@/lib/data/mockData";

export default function TasksPage() {
  return (
    <div>
      <h2>Tasks Page</h2>
      <p>This is the tasks page where you can see all and manage your tasks.</p>
      {/* Add more content or components related to tasks here */}
      <GetNextTaskToFinish />
      <TasksForThisWeek tasks={testTasks} />
      <TasksForThisMonth tasks={testTasks} />
    </div>
  );
}
