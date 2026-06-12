/**
 * Único punto de acceso al almacenamiento local de la sesión (token JWT + usuario).
 * Centraliza las claves y tolera entornos sin `localStorage` (tests/SSR).
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const tokenStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      // Ignorar errores de acceso a storage (por ejemplo en entornos sin window)
    }
  },

  getUserRaw(): string | null {
    try {
      return localStorage.getItem(USER_KEY)
    } catch {
      return null
    }
  },

  setUserRaw(json: string): void {
    try {
      localStorage.setItem(USER_KEY, json)
    } catch {
      // Ignorar errores de acceso a storage
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      // Ignorar si no se puede limpiar el storage
    }
  },
}
