import { Alert } from '../../../../components/ui'

interface FormErrorProps {
  error?: string
}

export default function FormError({ error }: FormErrorProps) {
  if (!error) return null

  return <Alert variant="danger">{error}</Alert>
}
