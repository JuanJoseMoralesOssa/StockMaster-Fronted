import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/home/Home'
import Product from './pages/product/Product'
import DashboardContent from './pages/home/components/DashboardContent'
import Kardex from './pages/kardex/Kardex'
import Expense from './pages/expense/Expense'
import Purchase from './pages/purchase/Purchase'
import User from './pages/user/User'
import Person from './pages/person/Person'
import useAuthStore from './stores/useAuthStore'
import { useEffect } from 'react'
import NotFound from './pages/components/common/NotFound'
import SupplierPaymentReport from './pages/dashboard/Dashboard'

function App() {
    const { isAuthenticated, checkAuth, logout } = useAuthStore()

    useEffect(() => {
        checkAuth()
    }, [])

    // const handleLogin = () => {
    //     setIsAuthenticated(true)
    // }

    // const handleLogout = () => {
    //     localStorage.removeItem('token')
    //     setIsAuthenticated(false)
    // }

    return (
        <BrowserRouter>
            {/* <Navigation isAuthenticated={isAuthenticated} onLogout={logout} />
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path="/register" element={<Register onLogin={handleLogin} />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
            </Routes>
            <Footer /> */}
            <Routes>
                <Route path='/' element={<Home />}>
                    <Route index element={<SupplierPaymentReport />} />
                    <Route path='productos' element={<Product />} />
                    <Route path='kardex' element={<Kardex />} />
                    <Route path='gastos' element={<Expense />} />
                    <Route path='compras' element={<Purchase />} />
                    <Route path='personas' element={<Person />} />
                    <Route path='usuarios' element={<User />} />

                    <Route path='*' element={<NotFound />} />
                </Route>
            </Routes>

            {/* <Route element={<AuthLayout />}>
                <Route path='login' element={<Login />} />
                <Route path='register' element={<Register />} />
            </Route>

            <Route path='concerts'>
                <Route index element={<ConcertsHome />} />
                <Route path=':city' element={<City />} />
                <Route path='trending' element={<Trending />} />
            </Route> */}

            {
                /* Nested Routes Routes can be nested inside parent routes.
            <Routes>
                <Route path='dashboard' element={<Dashboard />}>
                    <Route index element={<Home />} />
                    <Route path='settings' element={<Settings />} />
                </Route>
            </Routes>
            Copy code to clipboard The path of the parent is automatically included
            in the child, so this config creates both "/dashboard" and
            "/dashboard/settings" URLs. */
                // import { Outlet } from "react-router";
                // export default function Dashboard() {
                //   return (
                //     <section>
                //       <h1>Dashboard</h1>
                //       {/* will either be <Home/> or <Settings/> */}
                //       <Outlet />
                //     </section>
                //   );
                // }
            }

            {/* {<Route path='teams/:teamId' element={<Team />} />} */}
        </BrowserRouter>
    )
}

export default App
