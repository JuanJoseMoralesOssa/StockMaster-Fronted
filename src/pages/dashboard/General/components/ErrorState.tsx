import { Alert, Button } from '../../../../components/ui'

interface ErrorStateProps {
  error: string
  onRetry?: () => void
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Alert
      variant="danger"
      title="Error al cargar el análisis"
      action={
        onRetry ? (
          <Button variant="danger" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        ) : undefined
      }
    >
      {error}
    </Alert>
  )
}

export default ErrorState
