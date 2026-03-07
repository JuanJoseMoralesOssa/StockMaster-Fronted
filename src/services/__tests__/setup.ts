/**
 * Archivo de configuración global para las pruebas de integración.
 * Se ejecuta antes de cada archivo de prueba.
 */

import { afterEach, vi } from 'vitest'

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
  vi.clearAllMocks()
})
