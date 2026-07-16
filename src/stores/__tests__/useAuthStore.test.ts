/**
 * Pruebas de useAuthStore: checkAuth (sesión activa / sin sesión), login
 * (éxito / fallo) y logout. authService se mockea por completo con vi.mock;
 * zustand mantiene estado entre tests, así que reseteamos con setState en
 * beforeEach.
 */
import { authService, type LoginCredentials, type User } from '../../services/AuthService'
import useAuthStore from '../useAuthStore'

vi.mock('../../services/AuthService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    fetchCurrentUser: vi.fn(),
  },
}))

const FAKE_USER: User = { id: 1, email: 'ana@example.com', name: 'Ana', role: 'admin' }
const FAKE_CREDENTIALS: LoginCredentials = { email: 'ana@example.com', password: 'secret' }

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useAuthStore.setState({ isAuthenticated: false, isLoading: true, user: null })
  })

  describe('checkAuth', () => {
    it('con sesión activa (cookie válida): autentica y guarda el usuario', async () => {
      vi.mocked(authService.fetchCurrentUser).mockResolvedValue(FAKE_USER)

      await useAuthStore.getState().checkAuth()

      expect(authService.fetchCurrentUser).toHaveBeenCalledTimes(1)
      expect(useAuthStore.getState()).toMatchObject({
        isAuthenticated: true,
        isLoading: false,
        user: FAKE_USER,
      })
    })

    it('sin sesión (fetchCurrentUser lanza, ej. 401): deja el estado no autenticado sin lanzar', async () => {
      vi.mocked(authService.fetchCurrentUser).mockRejectedValue(new Error('No hay una sesión activa'))

      await expect(useAuthStore.getState().checkAuth()).resolves.toBeUndefined()

      expect(useAuthStore.getState()).toMatchObject({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })
    })
  })

  describe('login', () => {
    it('exitoso: autentica con el usuario devuelto por el backend', async () => {
      vi.mocked(authService.login).mockResolvedValue({ user: FAKE_USER })

      await useAuthStore.getState().login(FAKE_CREDENTIALS)

      expect(authService.login).toHaveBeenCalledWith(FAKE_CREDENTIALS)
      expect(useAuthStore.getState()).toMatchObject({
        isAuthenticated: true,
        isLoading: false,
        user: FAKE_USER,
      })
    })

    it('fallido: re-lanza el error, deja isLoading en false y no autentica', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Credenciales inválidas'))

      await expect(useAuthStore.getState().login(FAKE_CREDENTIALS)).rejects.toThrow(
        'Credenciales inválidas',
      )

      expect(useAuthStore.getState()).toMatchObject({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })
    })
  })

  describe('logout', () => {
    it('llama a authService.logout y limpia el estado, incluso partiendo de una sesión autenticada', async () => {
      useAuthStore.setState({ isAuthenticated: true, isLoading: false, user: FAKE_USER })
      vi.mocked(authService.logout).mockResolvedValue(undefined)

      await useAuthStore.getState().logout()

      expect(authService.logout).toHaveBeenCalledTimes(1)
      expect(useAuthStore.getState()).toMatchObject({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })
    })
  })
})
