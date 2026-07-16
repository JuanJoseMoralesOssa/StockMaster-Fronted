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
            // La sesión vive en una cookie httpOnly: /whoami es la única forma
            // de saber si hay una sesión activa y quién es el usuario.
            const user = await authService.fetchCurrentUser()
            set({ isAuthenticated: true, isLoading: false, user })
        } catch (error) {
            console.error('Error checking auth:', error)
            set({ isAuthenticated: false, isLoading: false, user: null })
        }
    },

    login: async (credentials: LoginCredentials) => {
        set({ isLoading: true })
        try {
            const response = await authService.login(credentials)

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
        // authService.logout() es best-effort: nunca lanza.
        await authService.logout()
        set({
            isAuthenticated: false,
            isLoading: false,
            user: null,
        })
    },
}))

export default useAuthStore
