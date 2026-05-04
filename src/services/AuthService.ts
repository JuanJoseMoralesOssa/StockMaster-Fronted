import axios from 'axios'
import { Config } from '../config/Config'

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
            const response = await axios.post<AuthResponse>(`${this.baseUrl}/sign-in`, credentials)
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

    // Métodos para manejar el almacenamiento local
    saveToken(token: string): void {
        localStorage.setItem('token', token)
    }

    getToken(): string | null {
        return localStorage.getItem('token')
    }

    saveUser(user: User): void {
        localStorage.setItem('user', JSON.stringify(user))
    }

    getUser(): User | null {
        const userData = localStorage.getItem('user')
        return userData ? JSON.parse(userData) : null
    }

    clearLocalData(): void {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
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
