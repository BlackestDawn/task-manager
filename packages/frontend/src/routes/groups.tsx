import { createFileRoute } from '@tanstack/react-router'
import GroupsPage from '../groupsPage/groupsPage'

export const Route = createFileRoute('/groups')({
  component: GroupsPage,
})
