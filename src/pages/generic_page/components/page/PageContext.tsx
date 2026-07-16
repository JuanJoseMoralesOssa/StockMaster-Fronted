/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode } from 'react'
import { PageContextValue } from '../../../../types/GenericTypes'

// `createContext` needs one concrete type; `T`/`TFilter` vary per page and
// aren't known here. Storing `unknown` (rather than `any`) keeps the module
// free of explicit `any` and pushes assignability checks to the boundaries:
// `PageContextProvider` writes into it below (anything is assignable to
// `unknown`), and `useGenericPageContext` reads back out with the one cast
// that TypeScript's generic-context pattern requires — `unknown` can be cast
// to anything, so the cast itself is unconstrained but localized to that spot.
const PageContext = createContext<unknown>(undefined)

export function useGenericPageContext<T, TFilter = object>() {
  const context = useContext(PageContext)
  if (!context) {
    throw new Error('useGenericPageContext must be used within a PageContextProvider')
  }
  return context as PageContextValue<T, TFilter>
}

export function PageContextProvider<T extends object, TFilter extends object = object>({
  value,
  children
}: {
  value: PageContextValue<T, TFilter>
  children: ReactNode
}) {
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>
}
