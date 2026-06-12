import { useMemo } from 'react'
import navItems from '../constants/NavItems'
import type NavItem from '../types/NavItem'
import useAuthStore from '../stores/useAuthStore'

/**
 * Items de navegación visibles para el rol del usuario actual.
 * Un item sin `roles` lo ven todos los autenticados; con `roles`, solo
 * quienes coincidan. La autorización real la impone el backend (esto es UX).
 */
export function useNavItems() {
  const role = useAuthStore((s) => s.user?.role)
  return useMemo(
    () => navItems.filter((item) => !item.roles || (!!role && item.roles.includes(role))),
    [role],
  )
}

/**
 * Visible nav items grouped by `category` (defaulting to "General"), as ordered
 * `[category, items]` entries. Shared by the desktop sidebar and mobile drawer.
 */
export function useGroupedNavItems(): [string, NavItem[]][] {
  const items = useNavItems()
  return useMemo(() => {
    const groups = items.reduce((acc, item) => {
      const category = item.category || 'General'
      ;(acc[category] ??= []).push(item)
      return acc
    }, {} as Record<string, NavItem[]>)
    return Object.entries(groups)
  }, [items])
}
