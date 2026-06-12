import { DashboardProvider } from './DashboardContext'
import DashboardInner from './DashboardInner'

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  )
}
