/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, ReactNode } from 'react'
import { PageContextValue } from '../../../../types/GenericTypes'

// The context is type-erased internally and reintroduced by the generic helper below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PageContext = createContext<PageContextValue<any, any> | undefined>(undefined)

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
