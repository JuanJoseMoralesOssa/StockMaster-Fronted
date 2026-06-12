import { useState, type InputHTMLAttributes } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "./Input"
import { cn } from "../../lib/utils"

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  hasError?: boolean
  /** Render the show/hide toggle button. Default: true. */
  showToggle?: boolean
  /** Controlled visibility. When omitted, the component manages its own state. */
  visible?: boolean
  /** Called when the toggle is pressed (required for controlled visibility). */
  onToggleVisibility?: () => void
}

/**
 * Password field with an accessible show/hide toggle. Wraps the design-system
 * `Input`, so it inherits the shared sizing, border, and focus styling.
 */
export function PasswordInput({
  hasError,
  showToggle = true,
  visible,
  onToggleVisibility,
  className,
  ...props
}: PasswordInputProps) {
  const [internalVisible, setInternalVisible] = useState(false)
  const isControlled = visible !== undefined
  const isVisible = isControlled ? visible : internalVisible
  const toggle = isControlled
    ? onToggleVisibility
    : () => setInternalVisible((v) => !v)

  return (
    <div className="relative">
      <Input
        type={isVisible ? "text" : "password"}
        hasError={hasError}
        className={cn(showToggle && "pr-10", className)}
        {...props}
      />
      {showToggle && (
        <button
          type="button"
          onClick={toggle}
          aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={isVisible}
          className="absolute inset-y-0 right-0 pr-3 flex items-center rounded text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  )
}
