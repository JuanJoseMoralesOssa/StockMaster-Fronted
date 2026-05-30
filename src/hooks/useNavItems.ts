import { useMemo } from 'react'
import navItems from '../constants/NavItems'
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
