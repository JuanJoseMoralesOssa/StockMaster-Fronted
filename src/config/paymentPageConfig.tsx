import Payment from '../types/Payment'
import PaymentDetails from '../types/PaymentDetails'
import { DateRangeFilters, buildInitialDateRangeFilters } from '../utils/date'
import { paymentService } from '../services/PaymentService'
import { buildDocumentPageConfig } from './documentPageConfig'
import DocumentCreate from '../pages/components/document/DocumentCreate'
import DocumentEditForm from '../pages/components/document/DocumentEditForm'
import DocumentFiltersSection from '../pages/components/document/DocumentFiltersSection'
import DocumentExpandedDetails from '../pages/components/document/DocumentExpandedDetails'

const PAYMENT_DETAILS_TITLE = 'Detalles del pago'

export const paymentPageConfig = buildDocumentPageConfig<
  Payment,
  PaymentDetails,
  DateRangeFilters,
  'payment_details'
>(
  {
    service: {
      getAllPaginated: (page: number, limit: number) => paymentService.getAllPaginatedWithDetails(page, limit),
      create: (data) => paymentService.createWithDetails(data as Payment),
      // El backend deshabilitó PATCH/PUT /payments/{id} (405): toda edición
      // debe ir por PUT /payments/with-details con version (optimistic locking).
      update: (id, data) => paymentService.updateWithDetails({ ...(data as Payment), id: Number(id) }),
      updatePartial: (id, data) => paymentService.updateWithDetails({ ...(data as Payment), id: Number(id) }),
      delete: (id, item) => paymentService.delete(id, item),
      getAllPaginatedFiltered: (filters, page, limit) => paymentService.getAllPaginatedFiltered(filters, page, limit),
    },
    entityName: 'Pago',
    entityNamePlural: 'Pagos',
    detailsKey: 'payment_details',
    fetchForEdit: (id) => paymentService.getByIdWithDetails(id as number),
    renderExpandedDetails: (item) => (
      <DocumentExpandedDetails<PaymentDetails> details={item.payment_details ?? []} />
    ),
    renderFilters: (props) => <DocumentFiltersSection {...props} />,
    renderCreateForm: (onSuccess, onItemCreated) => (
      <DocumentCreate<'payment_details', PaymentDetails, Payment>
        service={paymentService}
        detailsKey='payment_details'
        detailsTitle={PAYMENT_DETAILS_TITLE}
        successMessage='Pago creado exitosamente'
        errorMessage='Error al crear el pago'
        onSuccess={onSuccess}
        onCreated={onItemCreated}
      />
    ),
    renderEditForm: (item, onSuccess, onItemUpdated) => (
      <DocumentEditForm<'payment_details', PaymentDetails, Payment>
        key={item.id}
        initialDocument={item}
        service={paymentService}
        detailsKey='payment_details'
        detailsTitle={PAYMENT_DETAILS_TITLE}
        messages={{
          missingId: 'Error al editar el pago: ID no definido',
          missingDate: 'Error al editar el pago: Fecha no definida',
          success: 'Pago actualizado exitosamente',
          error: 'Error al actualizar el pago',
        }}
        onSuccess={onSuccess}
        onItemUpdated={onItemUpdated}
      />
    ),
  },
  buildInitialDateRangeFilters(),
)
