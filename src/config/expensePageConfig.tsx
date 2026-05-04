/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react'
import Expense from '../types/Expense'
import ExpenseDetails from '../types/ExpenseDetails'
import { DateRangeFilters, buildInitialDateRangeFilters } from '../utils/date'
import { expenseService } from '../services/ExpenseService'
import ExpenseCreate from '../pages/expense/components/ExpenseCreate'
import ExpenseEditForm from '../pages/expense/components/ExpenseEditForm'
import ExpenseFilters from '../pages/expense/components/ExpenseFilters'
import { buildDocumentPageConfig } from './documentPageConfig'
import { useProductStore, useSupplierStore } from '../stores'
import DocumentFiltersChrome from '../pages/components/common/DocumentFiltersChrome'
import DocumentDetailsExpandedView from '../pages/components/common/DocumentDetailsExpandedView'

function ExpenseExpandedDetails({ expense }: Readonly<{ expense: Expense }>) {
  const { products, fetchProducts } = useProductStore()
  const { suppliers, fetchSuppliers } = useSupplierStore()

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [fetchProducts, fetchSuppliers])

  return (
    <DocumentDetailsExpandedView<ExpenseDetails>
      details={expense.expense_details ?? []}
      products={products}
      suppliers={suppliers}
    />
  )
}

function ExpenseFiltersSection({
  filters,
  setFilters,
  onSearch,
  onClear,
}: Readonly<{
  filters: DateRangeFilters
  setFilters: (filters: DateRangeFilters) => void
  onSearch: () => void
  onClear: () => void
}>) {
  const products = useProductStore((state) => state.products)
  const suppliers = useSupplierStore((state) => state.suppliers)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers)

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [fetchProducts, fetchSuppliers])

  return (
    <DocumentFiltersChrome onSearch={onSearch} onClear={onClear}>
      <ExpenseFilters
        filters={filters}
        setFilters={setFilters}
        products={products}
        suppliers={suppliers}
      />
    </DocumentFiltersChrome>
  )
}

export const expensePageConfig = buildDocumentPageConfig<
  Expense,
  ExpenseDetails,
  DateRangeFilters,
  'expense_details'
>(
  {
    service: expenseService,
    entityName: 'Gasto',
    entityNamePlural: 'Gastos',
    detailsKey: 'expense_details',
    renderExpandedDetails: (item) => <ExpenseExpandedDetails expense={item} />,
    renderFilters: ({ filters, setFilters, onSearch, onClear }) => (
      <ExpenseFiltersSection
        filters={filters}
        setFilters={setFilters}
        onSearch={onSearch}
        onClear={onClear}
      />
    ),
    renderCreateForm: (onSuccess, onItemCreated) => (
      <ExpenseCreate onSuccess={onSuccess} onExpenseCreated={onItemCreated} />
    ),
    renderEditForm: (item, onSuccess, onItemUpdated) => (
      <ExpenseEditForm key={item.id} expense={item} onSuccess={onSuccess} onItemUpdated={onItemUpdated} />
    ),
  },
  buildInitialDateRangeFilters(),
)
