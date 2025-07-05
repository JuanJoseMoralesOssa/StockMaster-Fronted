import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <section>
        {
            import.meta.env.DEV &&
            <StrictMode>
                <App />
            </StrictMode>
        }
        {!import.meta.env.DEV && <App />}
    </section>
)
