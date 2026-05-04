import { cloneElement, isValidElement, useId, type ReactElement } from "react"
import { Label } from "./Label"
import { cn } from "../../lib/utils"

type FieldChildProps = {
  id?: string
  "aria-describedby"?: string
  hasError?: boolean
  required?: boolean
}

interface FieldGroupProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  htmlFor?: string
  className?: string
  children: ReactElement<FieldChildProps>
}

export function FieldGroup({
  label,
  error,
  hint,
  required,
  htmlFor,
  className,
  children,
}: FieldGroupProps) {
  const generatedId = useId()
  const childId = isValidElement(children) ? (children.props as FieldChildProps).id : undefined
  const inputId = htmlFor ?? childId ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined

  const clonedChild = isValidElement(children)
    ? cloneElement(children, {
        id: inputId,
        "aria-describedby": describedBy,
        hasError: Boolean(error),
        required: required || (children.props as FieldChildProps).required,
      } as FieldChildProps)
    : children

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}
      {clonedChild}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-(--color-text-muted)">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
