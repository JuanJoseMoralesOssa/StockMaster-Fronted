import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { cn } from "../../../lib/utils"
import { Input } from "../../../components/ui"

interface AutocompleteOption {
  id: string | number
  [key: string]: unknown
}

interface AutocompleteProps {
  options: AutocompleteOption[]
  label: string
  onSelect: (option: AutocompleteOption | null) => void
  displayKey?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  noOptionsText?: string
  maxOptions?: number
  initialValue?: string
  className?: string
  inputClassName?: string
  labelClassName?: string
}

export default function Autocomplete({
  options = [],
  label,
  onSelect,
  displayKey = "label",
  placeholder = "Buscar...",
  disabled = false,
  required = false,
  clearable = true,
  noOptionsText = "No se encontraron opciones",
  maxOptions = 50,
  initialValue = "",
  className = "",
  inputClassName = "",
  labelClassName = ""
}: Readonly<AutocompleteProps>) {
  const [inputValue, setInputValue] = useState(initialValue)
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputId = `autocomplete-${label.replace(/\s+/g, '-').toLowerCase()}`
  const listId = `autocomplete-list-${label.replace(/\s+/g, '-').toLowerCase()}`

  // Memoized filtered options with performance optimization
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options.slice(0, maxOptions)

    const filtered = options.filter(opt => {
      const displayValue = opt[displayKey]
      if (typeof displayValue !== 'string') return false
      return displayValue.toLowerCase().includes(inputValue.toLowerCase())
    })

    return filtered.slice(0, maxOptions)
  }, [inputValue, options, displayKey, maxOptions])

  const updateDropdownPosition = useCallback(() => {
    const input = inputRef.current
    if (!input) return

    const rect = input.getBoundingClientRect()
    setDropdownPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    })
  }, [])

  // Handle initial value - sync inputValue with initialValue
  useEffect(() => {
    // Intentionally update controlled input when `initialValue` changes.
    // This triggers a state update from a prop change; ESLint warns
    // about setState-in-effect but here it's intentional and safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(initialValue)
  }, [initialValue])

  // Reset highlight when filtered options change
  useEffect(() => {
    // Reset highlight index when filtered options change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightIndex(-1)
  }, [filteredOptions])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      const clickedInput = containerRef.current?.contains(target)
      const clickedDropdown = dropdownRef.current?.contains(target)

      if (!clickedInput && !clickedDropdown) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  useEffect(() => {
    if (!showDropdown) return

    updateDropdownPosition()
    window.addEventListener("resize", updateDropdownPosition)
    window.addEventListener("scroll", updateDropdownPosition, true)

    return () => {
      window.removeEventListener("resize", updateDropdownPosition)
      window.removeEventListener("scroll", updateDropdownPosition, true)
    }
  }, [showDropdown, updateDropdownPosition])

  // Handle option selection
  const handleSelect = useCallback((option: AutocompleteOption) => {
    const displayValue = typeof option[displayKey] === 'string' ? option[displayKey] : ''
    setInputValue(displayValue)
    setShowDropdown(false)
    setHighlightIndex(-1)
    onSelect(option)
  }, [displayKey, onSelect])

  // Handle input clear
  const handleClear = useCallback(() => {
    setInputValue('')
    setShowDropdown(false)
    setHighlightIndex(-1)
    onSelect(null)
    inputRef.current?.focus()
  }, [onSelect])

  // Handle input change with debounced filtering
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value.trim()) {
      updateDropdownPosition()
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }, [updateDropdownPosition])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowDropdown(true)
        return
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break

      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && filteredOptions[highlightIndex]) {
          handleSelect(filteredOptions[highlightIndex])
        }
        break

      case 'Escape':
        setShowDropdown(false)
        setHighlightIndex(-1)
        inputRef.current?.blur()
        break

      case 'Tab':
        setShowDropdown(false)
        break

      default:
        break
    }
  }, [showDropdown, filteredOptions, highlightIndex, handleSelect])

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (!disabled) {
      updateDropdownPosition()
      setShowDropdown(true)
    }
  }, [disabled, updateDropdownPosition])

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightIndex] as HTMLElement
      if (highlightedElement) {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: prefersReduced ? 'auto' : 'smooth'
        })
      }
    }
  }, [highlightIndex])

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label
          className={labelClassName || "block text-sm font-medium text-(--color-text-secondary) mb-1"}
          htmlFor={inputId}
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id={inputId}
          type="text"
          hasError={required && !inputValue}
          className={cn("pr-9", inputClassName)}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-activedescendant={
            highlightIndex >= 0
              ? `option-${filteredOptions[highlightIndex]?.id}`
              : undefined
          }
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />

        {/* Clear button */}
        {clearable && inputValue && !disabled && (
          <button
            type="button"
            className="absolute right-0 top-0 bottom-0 flex w-9 items-center justify-center text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors"
            onClick={handleClear}
            aria-label="Limpiar selección"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-9999 max-h-[min(15rem,40dvh)] overflow-hidden rounded-md border border-(--color-border) bg-(--color-bg-surface) shadow-lg"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          {filteredOptions.length > 0 ? (
            <div
              ref={listRef}
              id={listId}
              className="max-h-[min(15rem,40dvh)] overflow-y-auto flex flex-col"
              role="listbox"
              aria-labelledby={inputId}
            >
              {filteredOptions.map((option, i) => (
                <button
                  key={option.id || i}
                  type="button"
                  id={`option-${option.id}`}
                  role="option"
                  aria-selected={i === highlightIndex}
                  tabIndex={-1}
                  className={`flex min-h-11 w-full items-center text-left px-4 py-2.5 transition-colors border-none bg-transparent cursor-pointer
                    ${i === highlightIndex
                      ? "bg-(--view-accent-soft,var(--color-bg-subtle)) text-(--view-accent-text,var(--color-text-link)) font-semibold shadow-sm"
                      : "hover:bg-(--color-bg-subtle) text-(--color-text-primary)"
                    }
                  `}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelect(option)
                    }
                  }}
                >
                  {typeof option[displayKey] === 'string' ? option[displayKey] : 'Sin nombre'}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-2 text-(--color-text-secondary) text-sm">
              {noOptionsText}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
