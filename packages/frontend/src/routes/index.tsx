import { createFileRoute } from '@tanstack/react-router'
import MainContent from '../mainContent/mainContent'

export const Route = createFileRoute('/')({
  component: MainContent,
})
