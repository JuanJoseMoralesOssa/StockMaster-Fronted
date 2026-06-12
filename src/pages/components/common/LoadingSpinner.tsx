interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-(--view-accent,var(--color-action-bg)) ${sizeClasses[size]} ${className}`} />
  )
}

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-(--color-bg-page)">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-(--color-text-secondary) text-lg">Cargando...</p>
      </div>
    </div>
  )
}

export { LoadingSpinner, LoadingScreen }
