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
    private readonly baseUrl = `${Config.LOGIC_URL}`

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${this.baseUrl}/sign-in`, credentials)
            return response.data
        } catch (error) {
            console.error('Error en login:', error)
            throw new Error('Error al iniciar sesión. Verifica tus credenciales.')
        }
    }

    async logout(): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/logout`, {})
        } catch (error) {
            console.error('Error en logout:', error)
        } finally {
            this.clearLocalData()
        }
    }

    async verifyToken(token: string): Promise<User> {
        try {
            const response = await axios.get<User>(`${this.baseUrl}/verify`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return response.data
        } catch (error) {
            console.error('Error verificando token:', error)
            throw new Error('Token inválido')
        }
    }

    async refreshToken(): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${this.baseUrl}/refresh`, {})
            return response.data
        } catch (error) {
            console.error('Error refrescando token:', error)
            throw new Error('Error al refrescar el token')
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
