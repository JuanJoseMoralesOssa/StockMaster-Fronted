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
            if (!token || authService.isTokenExpired(token)) {
                authService.clearLocalData()
                set({ isAuthenticated: false, isLoading: false, user: null })
                return
            }

            // Validar el token contra el servidor (/whoami) y refrescar el
            // usuario/rol. Si el token es inválido o revocado, cerrar sesión.
            const user = await authService.verifyToken(token)
            authService.saveUser(user)
            set({ isAuthenticated: true, isLoading: false, user })
        } catch (error) {
            console.error('Error checking auth:', error)
            authService.clearLocalData()
            set({ isAuthenticated: false, isLoading: false, user: null })
        }
    },

    login: async (credentials: LoginCredentials) => {
        set({ isLoading: true })
        try {
            const response = await authService.login(credentials)

            // Guardar datos en localStorage
            authService.saveToken(response.token)
            authService.saveUser(response.user)
            set({
                isAuthenticated: true,
                isLoading: false,
                user: response.user
            })
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
