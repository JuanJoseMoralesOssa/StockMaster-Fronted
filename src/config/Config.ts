// Configuración de URLs por ambiente
const getApiUrl = (): string => {
    // En desarrollo usa la variable de entorno local o fallback
    if (import.meta.env.DEV) {
        return import.meta.env.VITE_API_URL_PROD || 'http://127.0.0.1:3000/'
    }

    // En producción debe usar la variable de entorno configurada en Azure
    const prodUrl = import.meta.env.VITE_API_URL_PROD
    if (!prodUrl) {
        console.error('⚠️ VITE_API_URL_PROD no está configurada para producción')
        throw new Error('URL del API no configurada para producción')
    }

    // Asegurar que la URL tenga protocolo
    return prodUrl.startsWith('http') ? prodUrl : `https://${prodUrl}`
}

export const LOGIC_URL = getApiUrl()

// Log para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
    console.log('🔗 API URL:', LOGIC_URL)
    console.log('🌍 Modo:', import.meta.env.MODE)
    console.log('📊 Variables disponibles:', {
        VITE_API_URL_PROD: import.meta.env.VITE_API_URL_PROD,
        VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
        VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD
    })
}

// Configuración de la aplicación usando variables de entorno
export const AppConfig = {
    title: import.meta.env.VITE_APP_TITLE || 'Mi Inventario',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    showConsoleLogs: import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true',
    requestTimeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 30000,
    defaultPageSize: Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10
}

export const defaultConfig = {
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
}

// Returns a fresh config object each call, so Authorization always uses the current token
export const getSecurityConfig = () => ({
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
})

// Agrupa y exporta la configuración como `Config` para importaciones tipo
// `import { Config } from '../config/Config'`
export const Config = {
    LOGIC_URL,
    AppConfig,
    defaultConfig,
    getSecurityConfig,
}
