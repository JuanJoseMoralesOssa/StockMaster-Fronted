import DetailedDashboard from './Detailed/DetailedDashboard'
import GeneralDashboard from './General/GeneralDashboard'
import { useDashboard } from './DashboardContext'

function RenderingWithMode() {
  const { dashboardMode } = useDashboard()

  return (
    <>
      {dashboardMode === 'detailed' && <DetailedDashboard />}
      {dashboardMode === 'general' && <GeneralDashboard />}
    </>
  )
}

export default RenderingWithMode
