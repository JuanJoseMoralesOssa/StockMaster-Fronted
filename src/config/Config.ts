export const LOGIC_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/'

export const defaultConfig = {
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
}

export const securityConfig = {
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
}

export * as Config from './Config'
