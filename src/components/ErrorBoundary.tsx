import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from './ui'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface the failure so it isn't silently swallowed in production.
    console.error('ErrorBoundary caught an error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex flex-col items-center justify-center p-8 bg-(--color-bg-surface) rounded-lg border border-(--color-border) text-center gap-3">
          <AlertTriangle className="w-10 h-10 text-danger-500" aria-hidden="true" />
          <p className="text-(--color-text-primary) font-medium">Error al cargar este gráfico</p>
          <p className="text-sm text-(--color-text-secondary)">{this.state.message}</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-2"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Reintentar
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
