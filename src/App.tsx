import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/home/Home'
import Product from './pages/product/Product'
import Kardex from './pages/kardex/Kardex'
import Expense from './pages/expense/Expense'
import Purchase from './pages/purchase/Purchase'
import User from './pages/user/User'
import Person from './pages/person/Person'
import useAuthStore from './stores/useAuthStore'
import { useEffect } from 'react'
import NotFound from './pages/components/common/NotFound'
import SupplierPaymentReport from './pages/dashboard/Dashboard'
import Login from './pages/components/auth/Login'
import PrivateRoute from './pages/components/auth/PrivateRoute'
import { LoadingScreen } from './pages/components/common/LoadingSpinner'
import AccessDenied from './pages/components/common/AccessDenied'

function App() {
    const { checkAuth, isLoading } = useAuthStore()

    useEffect(() => {
        checkAuth()
    }, [])

    // Mostrar loading mientras se verifica la autenticación inicial
    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública de login */}
                <Route path="/login" element={<Login />} />

                {/* Rutas protegidas */}
                <Route path='/' element={
                    <PrivateRoute element={<Home />} />
                }>
                    <Route index element={<SupplierPaymentReport />} />
                    <Route path='productos' element={<Product />} />
                    <Route path='kardex' element={<Kardex />} />
                    <Route path='gastos' element={<Expense />} />
                    <Route path='compras' element={<Purchase />} />
                    <Route path='personas' element={<Person />} />
                    <Route path='usuarios' element={<User />} />
                </Route>
                <Route path="/access-denied" element={<AccessDenied />} />
                {/* Ruta 404 */}
                <Route path='*' element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
