/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    base: '/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: undefined,
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
        target: 'esnext',
        minify: 'esbuild'
    },
    server: {
        host: true,
        port: 5173,
    },
    test: {
        globals: true,
        environment: 'node',
        setupFiles: ['./src/services/__tests__/setup.ts'],
        env: {
            VITE_API_URL_PROD: 'http://127.0.0.1:3000/',
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/services/**/*.ts', 'src/hooks/**/*.ts', 'src/utils/**/*.ts', 'src/stores/**/*.ts'],
            exclude: ['src/**/__tests__/**'],
        },
    }
})
