import { Button } from "../../../../components/ui"

interface FormActionsProps {
  loading: boolean
  submitLabel: string
  cancelLabel?: string
  onCancel?: () => void
}

export default function FormActions({ loading, submitLabel, cancelLabel, onCancel }: FormActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 flex gap-3 border-t border-(--color-border) bg-(--color-bg-surface) pt-4 pb-1">
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
