import Expense from '../types/Expense'
import ExpenseDetails from '../types/ExpenseDetails'
import { DateRangeFilters, buildInitialDateRangeFilters } from '../utils/date'
import { expenseService } from '../services/ExpenseService'
import { buildDocumentPageConfig } from './documentPageConfig'
import DocumentCreate from '../pages/components/document/DocumentCreate'
import DocumentEditForm from '../pages/components/document/DocumentEditForm'
import DocumentFiltersSection from '../pages/components/document/DocumentFiltersSection'
import DocumentExpandedDetails from '../pages/components/document/DocumentExpandedDetails'

const EXPENSE_DETAILS_TITLE = 'Detalles del gasto'

export const expensePageConfig = buildDocumentPageConfig<
  Expense,
  ExpenseDetails,
  DateRangeFilters,
  'expense_details'
>(
  {
    service: {
      getAllPaginated: (page: number, limit: number) => expenseService.getAllPaginatedWithDetails(page, limit),
      create: (data) => expenseService.createWithDetails(data as Expense),
      // El backend deshabilitó PATCH/PUT /expenses/{id} (405): toda edición
      // debe ir por PUT /expenses/with-details con version (optimistic locking).
      update: (id, data) => expenseService.updateWithDetails({ ...(data as Expense), id: Number(id) }),
      updatePartial: (id, data) => expenseService.updateWithDetails({ ...(data as Expense), id: Number(id) }),
      delete: (id, item) => expenseService.delete(id, item),
      getAllPaginatedFiltered: (filters, page, limit) => expenseService.getAllPaginatedFiltered(filters, page, limit),
    },
    entityName: 'Gasto',
    entityNamePlural: 'Gastos',
    detailsKey: 'expense_details',
    fetchForEdit: (id) => expenseService.getByIdWithDetails(id as number),
    renderExpandedDetails: (item) => (
      <DocumentExpandedDetails<ExpenseDetails> details={item.expense_details ?? []} />
    ),
    renderFilters: (props) => <DocumentFiltersSection {...props} />,
    renderCreateForm: (onSuccess, onItemCreated) => (
      <DocumentCreate<'expense_details', ExpenseDetails, Expense>
        service={expenseService}
        detailsKey='expense_details'
        detailsTitle={EXPENSE_DETAILS_TITLE}
        successMessage='Gasto creado exitosamente'
        errorMessage='Error al crear el gasto'
        onSuccess={onSuccess}
        onCreated={onItemCreated}
      />
    ),
    renderEditForm: (item, onSuccess, onItemUpdated) => (
      <DocumentEditForm<'expense_details', ExpenseDetails, Expense>
        key={item.id}
        initialDocument={item}
        service={expenseService}
        detailsKey='expense_details'
        detailsTitle={EXPENSE_DETAILS_TITLE}
        messages={{
          missingId: 'Error al editar el gasto: ID no definido',
          missingDate: 'Error al editar el gasto: Fecha no definida',
          success: 'Gasto actualizado exitosamente',
          error: 'Error al actualizar el gasto',
        }}
        onSuccess={onSuccess}
        onItemUpdated={onItemUpdated}
      />
    ),
  },
  buildInitialDateRangeFilters(),
)
