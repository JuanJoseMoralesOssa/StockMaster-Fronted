import { Alert, Button } from '../../../../components/ui'

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Alert
      variant="danger"
      title="Error al cargar el análisis"
      action={
        <div className="flex flex-wrap gap-2">
          <Button variant="danger" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      }
    >
      {error}
    </Alert>
  )
}

export default ErrorState
