/**
 * AuthService usa axios "pelado" (no el httpClient compartido) para login/
 * logout/whoami, así que se mockea el módulo axios directamente en vez de
 * la instancia httpClient.
 */
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { authService, type User } from '../AuthService'

describe('AuthService', () => {
  let mock: MockAdapter

  const FAKE_USER: User = { id: 1, email: 'ana@example.com', name: 'Ana', role: 'admin' }

  beforeEach(() => {
    mock = new MockAdapter(axios)
  })

  afterEach(() => {
    mock.restore()
  })

  describe('login', () => {
    it('envía la petición con withCredentials y devuelve el usuario', async () => {
      mock.onPost(/\/sign-in$/).reply(config => {
        expect(config.withCredentials).toBe(true)
        expect(JSON.parse(config.data)).toEqual({ email: 'ana@example.com', password: 'secret' })
        return [200, { user: FAKE_USER }]
      })

      const result = await authService.login({ email: 'ana@example.com', password: 'secret' })

      expect(result).toEqual({ user: FAKE_USER })
    })

    it('lanza un error legible si las credenciales son inválidas', async () => {
      mock.onPost(/\/sign-in$/).reply(401)

      await expect(
        authService.login({ email: 'ana@example.com', password: 'bad' }),
      ).rejects.toThrow('Error al iniciar sesión. Verifica tus credenciales.')
    })
  })

  describe('logout', () => {
    it('llama a /sign-out con withCredentials', async () => {
      mock.onPost(/\/sign-out$/).reply(config => {
        expect(config.withCredentials).toBe(true)
        return [204]
      })

      await expect(authService.logout()).resolves.toBeUndefined()
      expect(mock.history.post).toHaveLength(1)
    })

    it('no lanza si la petición falla (best-effort)', async () => {
      mock.onPost(/\/sign-out$/).networkError()

      await expect(authService.logout()).resolves.toBeUndefined()
    })
  })

  describe('fetchCurrentUser', () => {
    it('propaga el usuario devuelto por /whoami', async () => {
      mock.onGet(/\/whoami$/).reply(config => {
        expect(config.withCredentials).toBe(true)
        return [200, FAKE_USER]
      })

      const result = await authService.fetchCurrentUser()

      expect(result).toEqual(FAKE_USER)
    })

    it('lanza cuando no hay sesión activa (401)', async () => {
      mock.onGet(/\/whoami$/).reply(401)

      await expect(authService.fetchCurrentUser()).rejects.toThrow('No hay una sesión activa')
    })
  })
})
