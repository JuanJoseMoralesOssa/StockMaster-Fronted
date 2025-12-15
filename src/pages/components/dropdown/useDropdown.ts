import { useState, useRef, useEffect } from 'react'

export function useDropdown() {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIndex(null)
        setDropdownPosition(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar dropdown al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (openDropdownIndex !== null) {
        setOpenDropdownIndex(null)
        setDropdownPosition(null)
      }
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [openDropdownIndex])

  const handleDropdownToggle = (rowIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openDropdownIndex === rowIndex) {
      setOpenDropdownIndex(null)
      setDropdownPosition(null)
    } else {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 176 // 176px = w-44 (11rem)
      })
      setOpenDropdownIndex(rowIndex)
    }
  }

  const closeDropdown = () => {
    setOpenDropdownIndex(null)
    setDropdownPosition(null)
  }

  return {
    openDropdownIndex,
    dropdownPosition,
    dropdownRef,
    handleDropdownToggle,
    closeDropdown
  }
}
