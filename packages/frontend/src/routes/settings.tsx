import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '../settingsPage/settingsPage'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
