import { create } from 'zustand'
import { authService, type User, type LoginCredentials } from '../services/AuthService'

interface AuthStore {
    isAuthenticated: boolean
    isLoading: boolean
    user: User | null
    checkAuth: () => Promise<void>
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => Promise<void>
}

const useAuthStore = create<AuthStore>((set) => ({
    isAuthenticated: false,
    isLoading: true,
    user: null,

    checkAuth: async () => {
        set({ isLoading: true })
        try {
            const token = authService.getToken()
            if (!token) {
                set({ isAuthenticated: false, isLoading: false, user: null })
                return
            }

            // Verificar si el token ha expirado
            if (authService.isTokenExpired(token)) {
                authService.clearLocalData()
                set({ isAuthenticated: false, isLoading: false, user: null })
                return
            }

            // Para propósitos de demo, usar datos del localStorage
            // En producción, aquí verificarías el token con el servidor
            const localUser = authService.getUser()
            if (localUser) {
                set({
                    isAuthenticated: true,
                    isLoading: false,
                    user: localUser
                })
            } else {
                authService.clearLocalData()
                set({ isAuthenticated: false, isLoading: false, user: null })
            }
        } catch (error) {
            console.error('Error checking auth:', error)
            authService.clearLocalData()
            set({ isAuthenticated: false, isLoading: false, user: null })
        }
    },

    login: async (credentials: LoginCredentials) => {
        set({ isLoading: true })
        try {
            // Para propósitos de demo, simular login exitoso
            if (credentials.email === 'admin@ejemplo.com' && credentials.password === 'admin123') {
                const mockUser: User = {
                    id: 1,
                    email: credentials.email,
                    name: 'Administrador',
                    role: 'admin'
                }
                const mockToken = 'mock-jwt-token-' + Date.now()

                // Guardar datos en localStorage
                authService.saveToken(mockToken)
                authService.saveUser(mockUser)

                set({
                    isAuthenticated: true,
                    isLoading: false,
                    user: mockUser
                })
            } else {
                throw new Error('Credenciales incorrectas')
            }
        } catch (error) {
            set({ isLoading: false })
            throw error
        }
    },

    logout: async () => {
        set({ isLoading: true })
        try {
            authService.clearLocalData()
        } catch (error) {
            console.error('Error during logout:', error)
        } finally {
            set({
                isAuthenticated: false,
                isLoading: false,
                user: null,
            })
        }
    },
}))

export default useAuthStore
