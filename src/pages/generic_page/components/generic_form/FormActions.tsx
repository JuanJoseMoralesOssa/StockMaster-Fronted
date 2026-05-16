import { Button } from "../../../../components/ui"

interface FormActionsProps {
  loading: boolean
  submitLabel: string
  cancelLabel?: string
  onCancel?: () => void
}

export default function FormActions({ loading, submitLabel, cancelLabel, onCancel }: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className="flex-1"
      >
        {submitLabel}
      </Button>
      {onCancel && (
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          {cancelLabel}
        </Button>
      )}
    </div>
  )
}
