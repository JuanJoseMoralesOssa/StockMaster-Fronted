// Configuración de URLs por ambiente
const getApiUrl = (): string => {
    // En desarrollo usa VITE_API_URL (solo dev) o fallback a localhost
    if (import.meta.env.DEV) {
        return import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/'
    }

    // En producción usa VITE_API_URL_PROD configurada en Azure / Vercel
    const prodUrl = import.meta.env.VITE_API_URL_PROD
    if (!prodUrl) {
        throw new Error('VITE_API_URL_PROD no está configurada: el API no tiene URL en producción')
    }

    // Asegurar que la URL tenga protocolo y trailing slash
    const normalized = prodUrl.startsWith('http') ? prodUrl : `https://${prodUrl}`
    return normalized.endsWith('/') ? normalized : `${normalized}/`
}

export const LOGIC_URL = getApiUrl()

export const AppConfig = {
    requestTimeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 30000,
}

export const defaultConfig = {
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
}

// Agrupa y exporta la configuración como `Config` para importaciones tipo
// `import { Config } from '../config/Config'`
export const Config = {
    LOGIC_URL,
    AppConfig,
    defaultConfig,
}
