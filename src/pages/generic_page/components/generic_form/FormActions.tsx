import PrimaryButton from "../../../components/common/PrimaryButton"

interface FormActionsProps {
  loading: boolean
  submitLabel: string
  cancelLabel?: string
  onCancel?: () => void
}

export default function FormActions({ loading, submitLabel, cancelLabel, onCancel }: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <PrimaryButton
        type="submit"
        disabled={loading}
        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Procesando...' : submitLabel}
      </PrimaryButton>
      {onCancel && (
        <PrimaryButton
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {cancelLabel}
        </PrimaryButton>
      )}
    </div>
  )
}
