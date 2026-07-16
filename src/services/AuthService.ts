import axios from 'axios'
import { AppConfig, Config } from '../config/Config'

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
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

    constructor() {
        // Limpieza de la sesión pre-cookies: hasta esta migración el token y el
        // usuario se guardaban en localStorage. Ya no se usan (la sesión vive en
        // una cookie httpOnly), pero puede quedar basura de sesiones viejas en el
        // navegador. Se puede borrar este bloque en unos meses.
        try {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        } catch {
            // Tolerar entornos sin localStorage (tests/SSR)
        }
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // axios "pelado" a propósito: el interceptor global de 401/403 del
            // httpClient dispararía logout/redirect sobre un login fallido.
            const response = await axios.post<AuthResponse>(`${this.baseUrl}/sign-in`, credentials, {
                timeout: AppConfig.requestTimeout,
                withCredentials: true,
            })
            return response.data
        } catch (error) {
            console.error('Error en login:', error)
            throw new Error('Error al iniciar sesión. Verifica tus credenciales.', { cause: error })
        }
    }

    async logout(): Promise<void> {
        try {
            // Best-effort: el backend limpia la cookie httpOnly. Si la petición
            // falla (red caída, etc.) no tiene sentido lanzar: el logout local
            // (estado del store) sigue adelante igual.
            await axios.post(`${this.baseUrl}/sign-out`, null, {
                timeout: AppConfig.requestTimeout,
                withCredentials: true,
            })
        } catch (error) {
            console.error('Error en logout:', error)
        }
    }

    async fetchCurrentUser(): Promise<User> {
        try {
            const response = await axios.get<User>(`${this.baseUrl}/whoami`, {
                timeout: AppConfig.requestTimeout,
                withCredentials: true,
            })
            return response.data
        } catch (error) {
            console.error('Error obteniendo el usuario actual:', error)
            throw new Error('No hay una sesión activa', { cause: error })
        }
    }
}

export const authService = new AuthService()
