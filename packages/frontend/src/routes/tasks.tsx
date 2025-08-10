import { createFileRoute } from '@tanstack/react-router'
import TasksPage from '../tasksPage/tasksPage'

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
})
