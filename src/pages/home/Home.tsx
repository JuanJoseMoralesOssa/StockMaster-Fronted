import { Outlet } from 'react-router-dom'
import { DashboardLayout } from './components/DashboardLayout'

function Home() {
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    )
}

export default Home
