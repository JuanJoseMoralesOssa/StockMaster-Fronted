interface FormErrorProps {
  error?: string
}

export default function FormError({ error }: FormErrorProps) {
  if (!error) return null

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  )
}
