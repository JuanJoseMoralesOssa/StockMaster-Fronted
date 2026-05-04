import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import useAuthStore from './stores/useAuthStore'
import { LoadingScreen } from './pages/components/common/LoadingSpinner'
// Import theme store so the subscription runs before the app renders
import './stores/useThemeStore'
import { useNavigate } from 'react-router-dom'
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
const User = lazy(() => import('./pages/user/User'))
const Person = lazy(() => import('./pages/person/Person'))
const SupplierPaymentReport = lazy(() => import('./pages/dashboard/Dashboard'))
const Kardex = lazy(() => import('./pages/kardex/Kardex'))
// const GenericPage = lazy(() => import('./pages/generic_page/GenericPage'))

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
            <Suspense fallback={<LoadingScreen />}>
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
            </Suspense>
        </BrowserRouter>
    )
}

export default App
