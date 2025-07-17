import { useState, useRef, useEffect, useCallback, useMemo } from "react";

interface AutocompleteOption {
  id: string | number;
  [key: string]: unknown;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  label: string;
  onSelect: (option: AutocompleteOption | null) => void;
  displayKey?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  noOptionsText?: string;
  maxOptions?: number;
  initialValue?: string;
  className?: string;
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
  className = ""
}: Readonly<AutocompleteProps>) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Memoized filtered options with performance optimization
  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options.slice(0, maxOptions);

    const filtered = options.filter(opt => {
      const displayValue = opt[displayKey];
      if (typeof displayValue !== 'string') return false;
      return displayValue.toLowerCase().includes(inputValue.toLowerCase());
    });

    return filtered.slice(0, maxOptions);
  }, [inputValue, options, displayKey, maxOptions]);

  // Handle initial value - sync inputValue with initialValue
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Reset highlight when filtered options change
  useEffect(() => {
    setHighlightIndex(-1);
  }, [filteredOptions]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  // Handle option selection
  const handleSelect = useCallback((option: AutocompleteOption) => {
    const displayValue = typeof option[displayKey] === 'string' ? option[displayKey] : '';
    setInputValue(displayValue);
    setShowDropdown(false);
    setHighlightIndex(-1);
    onSelect(option);
  }, [displayKey, onSelect]);

  // Handle input clear
  const handleClear = useCallback(() => {
    setInputValue('');
    setShowDropdown(false);
    setHighlightIndex(-1);
    onSelect(null);
    inputRef.current?.focus();
  }, [onSelect]);

  // Handle input change with debounced filtering
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, []);  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowDropdown(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && filteredOptions[highlightIndex]) {
          handleSelect(filteredOptions[highlightIndex]);
        }
        break;

      case 'Escape':
        setShowDropdown(false);
        setHighlightIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        setShowDropdown(false);
        break;

      default:
        break;
    }
  }, [showDropdown, filteredOptions, highlightIndex, handleSelect]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (!disabled) {
      setShowDropdown(true);
    }
  }, [disabled]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightIndex]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor={`autocomplete-${label.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          id={`autocomplete-${label.replace(/\s+/g, '-').toLowerCase()}`}
          type="text"
          className={`w-full border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${required && !inputValue ? 'border-red-300' : ''}
          `}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="true"
          aria-controls={`autocomplete-list-${label.replace(/\s+/g, '-').toLowerCase()}`}
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
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={handleClear}
            aria-label="Limpiar selección"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-hidden">
          {filteredOptions.length > 0 ? (
            <div
              ref={listRef}
              id={`autocomplete-list-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className="max-h-60 overflow-y-auto flex flex-col"
              role="menu"
              aria-labelledby={`autocomplete-${label.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {filteredOptions.map((option, i) => (
                <button
                  key={option.id || i}
                  type="button"
                  id={`option-${option.id}`}
                  role="menuitem"
                  tabIndex={-1}
                  className={`w-full text-left px-4 py-2 transition-colors border-none bg-transparent cursor-pointer
                    ${i === highlightIndex
                      ? "bg-blue-500 text-blue-900 font-semibold shadow-sm text-lg"
                      : "hover:bg-gray-100 text-gray-900"
                    }
                  `}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(option);
                    }
                  }}
                >
                  {typeof option[displayKey] === 'string' ? option[displayKey] : 'Sin nombre'}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">
              {noOptionsText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
