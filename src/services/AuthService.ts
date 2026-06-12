import axios from 'axios'
import { AppConfig, Config } from '../config/Config'
import { tokenStorage } from './tokenStorage'

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
    token: string
    user: {
        id: number
        email: string
        name: string
        role?: string
    }
}

export interface User {
    id: number
    email: string
    name: string
    role?: string
}

class AuthService {
    // Normalizamos la URL base para evitar dobles barras (`//`) al concatenar rutas
    private readonly baseUrl = Config.LOGIC_URL.replace(/\/+$/, '')

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // axios "pelado" a propósito: el interceptor global de 401/403 del
            // httpClient dispararía logout/redirect sobre un login fallido.
            const response = await axios.post<AuthResponse>(`${this.baseUrl}/sign-in`, credentials, {
                timeout: AppConfig.requestTimeout,
            })
            return response.data
        } catch (error) {
            console.error('Error en login:', error)
            throw new Error('Error al iniciar sesión. Verifica tus credenciales.', { cause: error })
        }
    }

    async logout(): Promise<void> {
        try {
            // Frontend solo maneja borrado local (stateless JWT en backend)
            this.clearLocalData()
        } catch (error) {
            console.error('Error en logout:', error)
        }
    }

    async verifyToken(token: string): Promise<User> {
        try {
            const response = await axios.get<User>(`${this.baseUrl}/whoami`, {
                timeout: AppConfig.requestTimeout,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            return response.data
        } catch (error) {
            console.error('Error verificando token:', error)
            throw new Error('Token inválido', { cause: error })
        }
    }

    // Almacenamiento local de la sesión: delega en tokenStorage (única fuente de claves)
    saveToken(token: string): void {
        tokenStorage.setToken(token)
    }

    getToken(): string | null {
        return tokenStorage.getToken()
    }

    saveUser(user: User): void {
        tokenStorage.setUserRaw(JSON.stringify(user))
    }

    getUser(): User | null {
        const userData = tokenStorage.getUserRaw()
        return userData ? JSON.parse(userData) : null
    }

    clearLocalData(): void {
        tokenStorage.clear()
    }

    isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const currentTime = Date.now() / 1000
            return payload.exp < currentTime
        } catch (error) {
            console.error('Error parsing token:', error)
            return true
        }
    }

}

export const authService = new AuthService()
