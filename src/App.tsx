import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import useAuthStore from './stores/useAuthStore'
import { Roles } from './enums/Roles'
import { LoadingScreen } from './pages/components/common/LoadingSpinner'
import { useNavigate, useLocation } from 'react-router-dom'
import { configureHttpClient } from './services/httpClient'

// Eagerly load auth/shell components — needed before any route resolves
import Home from './pages/home/Home'
import Login from './pages/components/auth/Login'
import PrivateRoute from './pages/components/auth/PrivateRoute'
import AccessDenied from './pages/components/common/AccessDenied'
import NotFound from './pages/components/common/NotFound'

// Lazy-load heavy page components to reduce initial bundle size
const Product = lazy(() => import('./pages/product/Product'))
const Expense = lazy(() => import('./pages/expense/Expense'))
const Purchase = lazy(() => import('./pages/purchase/Purchase'))
const ScanPurchase = lazy(() => import('./pages/purchase/scan/ScanPurchase'))
const User = lazy(() => import('./pages/user/User'))
const Person = lazy(() => import('./pages/person/Person'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Kardex = lazy(() => import('./pages/kardex/Kardex'))

function HttpClientAuthBridge() {
    const navigate = useNavigate()

    useEffect(() => {
        configureHttpClient({
            onUnauthenticated: () => {
                void useAuthStore.getState().logout().finally(() => {
                    navigate('/login', { replace: true })
                })
            },
        })

        return () => configureHttpClient({ onUnauthenticated: undefined })
    }, [navigate])

    return null
}

// Reset scroll to the top on every route change so a new page never opens
// mid-scroll (most noticeable on mobile after a long list).
function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [pathname])
    return null
}

// Página inicial según rol: el Operador no ve el Dashboard, va a Compras.
function DefaultLanding() {
    const role = useAuthStore((s) => s.user?.role)
    if (role === Roles.OPERATOR) {
        return <Navigate to="/compras" replace />
    }
    return <Dashboard />
}

const OFFICE_ADMIN = [Roles.OFFICE, Roles.ADMIN]

function App() {
    const { checkAuth, isLoading } = useAuthStore()

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    // Mostrar loading mientras se verifica la autenticación inicial
    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        <BrowserRouter>
            <HttpClientAuthBridge />
            <ScrollToTop />
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    {/* Ruta pública de login */}
                    <Route path="/login" element={<Login />} />

                    {/* Rutas protegidas */}
                    <Route path='/' element={
                        <PrivateRoute element={<Home />} />
                    }>
                        <Route index element={<DefaultLanding />} />
                        <Route path='productos' element={<Product />} />
                        <Route path='kardex' element={<PrivateRoute element={<Kardex />} allowedRoles={OFFICE_ADMIN} />} />
                        <Route path='gastos' element={<Expense />} />
                        <Route path='compras' element={<Purchase />} />
                        <Route path='compras/escanear' element={<ScanPurchase />} />
                        <Route path='personas' element={<Person />} />
                        <Route path='usuarios' element={<PrivateRoute element={<User />} allowedRoles={OFFICE_ADMIN} />} />
                    </Route>
                    <Route path="/access-denied" element={<AccessDenied />} />
                    {/* Ruta 404 */}
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App
