import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import NoAssignedModules from './pages/components/common/NoAssignedModules'
import NotFound from './pages/components/common/NotFound'

// Lazy-load heavy page components to reduce initial bundle size
const Product = lazy(() => import('./pages/product/Product'))
const Payment = lazy(() => import('./pages/payment/Payment'))
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

// Pagina inicial segun rol: los endpoints operativos hoy son solo Oficina/Admin.
function DefaultLanding() {
    const role = useAuthStore((s) => s.user?.role)
    if (!role || !OFFICE_ADMIN.includes(role)) {
        return <NoAssignedModules />
    }
    return <Dashboard />
}

const OFFICE_ADMIN: string[] = [Roles.OFFICE, Roles.ADMIN]

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
                        <Route path='productos' element={<PrivateRoute element={<Product />} allowedRoles={OFFICE_ADMIN} />} />
                        <Route path='kardex' element={<PrivateRoute element={<Kardex />} allowedRoles={OFFICE_ADMIN} />} />
                        <Route path='pagos' element={<PrivateRoute element={<Payment />} allowedRoles={OFFICE_ADMIN} />} />
                        <Route path='compras' element={<PrivateRoute element={<Purchase />} allowedRoles={OFFICE_ADMIN} />} />
                        <Route path='compras/escanear' element={<PrivateRoute element={<ScanPurchase />} allowedRoles={OFFICE_ADMIN} />} />
                        <Route path='personas' element={<PrivateRoute element={<Person />} allowedRoles={OFFICE_ADMIN} />} />
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
