import { Outlet } from 'react-router-dom'
import DashboardContent from './components/DashboardContent'
import { DashboardLayout } from './components/DashboardLayout'

function Home() {
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    )
}

export default Home
