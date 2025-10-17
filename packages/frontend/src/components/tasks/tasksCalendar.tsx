'use client';
import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getTasksAction } from "@/lib/actions/tasks";
import { Can } from "@/components/auth/can";
import type { Task } from "@task-manager/common";
import { Calendar, ChevronLeft, ChevronRight, Plus, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import CreateTaskDialog from "@/components/tasks/createTaskDialog";
import TaskStatusBadge from "./taskStatusBadge";

type CalendarView = "week" | "month" | "year";

interface DayData {
  date: Date;
  taskCount: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface TasksCalendarProps {
  initialTasks: Task[];
}

export default function TasksPage({ initialTasks }: TasksCalendarProps) {
  const [isPending, startTransition] = useTransition();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
  const router = useRouter();

  const today = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const refreshTasks = () => {
    startTransition(async () => {
      const updatedTasks = await getTasksAction();
      setTasks(updatedTasks);
    });
  };

  const getCalendarDays = useMemo((): DayData[] => {
    const days: DayData[] = [];

    if (view === "week") {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = (currentDate.getDay() + 6) % 7;
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        date.setHours(0, 0, 0, 0);

        const taskCount = tasks.filter(task => {
          if (!task.finishBy) return false;
          const taskDate = new Date(task.finishBy);
          taskDate.setHours(0, 0, 0, 0);
          return date.getTime() === taskDate.getTime();
        }).length;

        days.push({
          date,
          taskCount,
          isCurrentMonth: date.getMonth() === currentDate.getMonth(),
          isToday: date.getTime() === today.getTime()
        });
      }
    } else if (view === "month") {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startDay = new Date(firstDay);
      const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
      startDay.setDate(firstDay.getDate() - firstDayOfWeek);

      const endDay = new Date(lastDay);
      const lastDayOfWeek = (lastDay.getDay() + 6) % 7;
      endDay.setDate(lastDay.getDate() + (6 - lastDayOfWeek));

      for (let date = new Date(startDay); date <= endDay; date.setDate(date.getDate() + 1)) {
        const dayDate = new Date(date);
        dayDate.setHours(0, 0, 0, 0);

        const taskCount = tasks.filter(task => {
          if (!task.finishBy) return false;
          const taskDate = new Date(task.finishBy);
          taskDate.setHours(0, 0, 0, 0);
          return dayDate.getTime() === taskDate.getTime();
        }).length;

        days.push({
          date: dayDate,
          taskCount,
          isCurrentMonth: dayDate.getMonth() === currentDate.getMonth(),
          isToday: dayDate.getTime() === today.getTime()
        });
      }
    } else if (view === "year") {
      for (let month = 0; month < 12; month++) {
        const date = new Date(currentDate.getFullYear(), month, 1);
        date.setHours(0, 0, 0, 0);

        const taskCount = tasks.filter(task => {
          if (!task.finishBy) return false;
          const taskDate = new Date(task.finishBy);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getFullYear() === date.getFullYear() && taskDate.getMonth() === date.getMonth();
        }).length;

        days.push({
          date,
          taskCount,
          isCurrentMonth: true,
          isToday: date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
        });
      }
    }

    return days;
  }, [tasks, currentDate, view, today]);

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];

    return tasks.filter(task => {
      if (!task.finishBy) return false;
      const taskDate = new Date(task.finishBy);
      taskDate.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      if (view === "year") return taskDate.getFullYear() === selected.getFullYear() && taskDate.getMonth() === selected.getMonth();
      return taskDate.getTime() === selected.getTime();
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.finishBy!).getTime() - new Date(b.finishBy!).getTime();
    });
  }, [tasks, selectedDate, view]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (view === "month") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setFullYear(currentDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  }

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "week") {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (view === "month") {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else {
      newDate.setFullYear(currentDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  }

  const handleToday = () => {
    setCurrentDate(new Date());
  }

  const handleDayClick = (day: DayData) => {
    setSelectedDate(day.date);
  }

  const handleCreateTask = (date: Date | null = null) => {
    setPrefilledDate(date);
    setShowCreateDialog(true);
  }

  const handleTaskCreated = () => {
    setShowCreateDialog(false);
    setPrefilledDate(null);
    refreshTasks();
    router.refresh();
  }

  const getDateLabel = () => {
    if (view === "week") {
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = (currentDate.getDay() + 6) % 7;
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else if (view === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else {
      return currentDate.toLocaleDateString("en-US", { year: "numeric" });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks Calendar</h1>

          <Can I="create" a="Task">
            <button
              onClick={() => handleCreateTask(null)}
              disabled={isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </button>
          </Can>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevious}
                disabled={isPending}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[200px] text-center">
                {getDateLabel()}
              </h2>

              <button
                onClick={handleNext}
                disabled={isPending}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <button
                onClick={handleToday}
                disabled={isPending}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Today
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView("week")}
                disabled={isPending}
                className={`px-3 py-1 text-sm rounded-md disabled:opacity-50 ${view === "week"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                Week
              </button>
              <button
                onClick={() => setView("month")}
                disabled={isPending}
                className={`px-3 py-1 text-sm rounded-md disabled:opacity-50 ${view === "month"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                Month
              </button>
              <button
                onClick={() => setView("year")}
                disabled={isPending}
                className={`px-3 py-1 text-sm rounded-md disabled:opacity-50 ${view === "year"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                Year
              </button>
            </div>
          </div>

          {view === "week" && (
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
              {getCalendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={isPending}
                  className={`
                    relative p-4 rounded-lg border-2 min-h-[80px] text-left transition-colors disabled:opacity-50
                    ${day.isToday ? "border-indigo-600" : "border-gray-200 dark:border-gray-700"}
                    ${selectedDate?.getTime() === day.date.getTime() ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-white dark:bg-gray-800"}
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                  `}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {day.date.getDate()}
                  </div>
                  {day.taskCount > 0 && (
                    <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {day.taskCount} task{day.taskCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {view === "month" && (
            <div className="grid grid-cols-7 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
              {getCalendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={isPending}
                  className={`
                    relative p-3 rounded-lg border-2 min-h-[80px] text-left transition-colors disabled:opacity-50
                    ${!day.isCurrentMonth ? "opacity-40" : ""}
                    ${day.isToday ? "border-indigo-600" : "border-gray-200 dark:border-gray-700"}
                    ${selectedDate?.getTime() === day.date.getTime() ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-white dark:bg-gray-800"}
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                  `}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {day.date.getDate()}
                  </div>
                  {day.taskCount > 0 && (
                    <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {day.taskCount} task{day.taskCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {view === "year" && (
            <div className="grid grid-cols-3 gap-4">
              {getCalendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={isPending}
                  className={`
                    relative p-4 rounded-lg border-2 min-h-[100px] text-left transition-colors disabled:opacity-50
                    ${day.isToday ? "border-indigo-600" : "border-gray-200 dark:border-gray-700"}
                    ${selectedDate?.getMonth() === day.date.getMonth() && selectedDate?.getFullYear() === day.date.getFullYear() ? "bg-indigo-50 dark:bg-indigo-900/20" : "bg-white dark:bg-gray-800"}
                    hover:bg-gray-50 dark:hover:bg-gray-700/50
                  `}
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {day.date.toLocaleDateString('en-US', { month: 'long' })}
                  </div>
                  {day.taskCount > 0 && (
                    <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {day.taskCount} task{day.taskCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedDate && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {view === "year"
                  ? `Tasks for ${selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                  : `Tasks for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                }
              </h3>

              <Can I="create" a="Task">
                <button
                  onClick={() => handleCreateTask(selectedDate)}
                  disabled={isPending}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </button>
              </Can>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No tasks for this {view === "year" ? "month" : "date"}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {selectedTasks.map((task) => (
                  <li key={task.id} className="py-4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="block hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-2 px-2 py-2 rounded-md transition-colors"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {task.completed ? (
                            <CheckSquare className="h-5 w-5 text-green-500" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className={`text-sm font-medium ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            <TaskStatusBadge task={task} />
                            {task.finishBy && view !== "year" && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Due: {new Date(task.finishBy).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {showCreateDialog && (
        <CreateTaskDialog
          isOpen={showCreateDialog}
          onClose={() => {
            setShowCreateDialog(false);
            setPrefilledDate(null);
          }}
          onSuccess={handleTaskCreated}
          prefilledDate={prefilledDate}
        />
      )}
    </div>
  );
}
