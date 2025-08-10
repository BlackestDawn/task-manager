import { createFileRoute } from '@tanstack/react-router'
import UsersPage from '../usersPage/usersPage'

export const Route = createFileRoute('/users')({
  component: UsersPage,
})
