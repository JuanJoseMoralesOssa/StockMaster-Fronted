import Purchase from '../types/Purchase'
import PurchaseDetails from '../types/PurchaseDetails'
import { DateRangeFilters, buildInitialDateRangeFilters } from '../utils/date'
import { purchaseService } from '../services/PurchaseService'
import ScanFormButton from '../pages/purchase/components/ScanFormButton'
import { buildDocumentPageConfig } from './documentPageConfig'
import DocumentCreate from '../pages/components/document/DocumentCreate'
import DocumentEditForm from '../pages/components/document/DocumentEditForm'
import DocumentFiltersSection from '../pages/components/document/DocumentFiltersSection'
import DocumentExpandedDetails from '../pages/components/document/DocumentExpandedDetails'

const PURCHASE_DETAILS_TITLE = 'Detalles de la compra'

const basePurchasePageConfig = buildDocumentPageConfig<
  Purchase,
  PurchaseDetails,
  DateRangeFilters,
  'purchase_details'
>(
  {
    service: {
      getAllPaginated: (page: number, limit: number) => purchaseService.getAllPaginatedWithDetails(page, limit),
      create: (data) => purchaseService.createWithDetails(data as Purchase),
      // El backend deshabilitó PATCH/PUT /purchases/{id} (405): toda edición
      // debe ir por PUT /purchases/with-details con version (optimistic locking).
      update: (id, data) => purchaseService.updateWithDetails({ ...(data as Purchase), id: Number(id) }),
      updatePartial: (id, data) => purchaseService.updateWithDetails({ ...(data as Purchase), id: Number(id) }),
      delete: (id, item) => purchaseService.delete(id, item),
      getAllPaginatedFiltered: (filters, page, limit) => purchaseService.getAllPaginatedFiltered(filters, page, limit),
    },
    entityName: 'Compra',
    entityNamePlural: 'Compras',
    detailsKey: 'purchase_details',
    fetchForEdit: (id) => purchaseService.getByIdWithDetails(id as number),
    renderExpandedDetails: (item) => (
      <DocumentExpandedDetails<PurchaseDetails> details={item.purchase_details ?? []} />
    ),
    renderFilters: (props) => <DocumentFiltersSection {...props} />,
    renderCreateForm: (onSuccess, onItemCreated) => (
      <DocumentCreate<'purchase_details', PurchaseDetails, Purchase>
        service={purchaseService}
        detailsKey='purchase_details'
        detailsTitle={PURCHASE_DETAILS_TITLE}
        successMessage='Compra creada exitosamente'
        errorMessage='Error al crear la compra'
        onSuccess={onSuccess}
        onCreated={onItemCreated}
      />
    ),
    renderEditForm: (item, onSuccess, onItemUpdated, onItemDeleted) => (
      <DocumentEditForm<'purchase_details', PurchaseDetails, Purchase>
        key={item.id}
        initialDocument={item}
        service={purchaseService}
        detailsKey='purchase_details'
        detailsTitle={PURCHASE_DETAILS_TITLE}
        messages={{
          missingId: 'Error al editar la compra: ID no definido',
          missingDate: 'Error al editar la compra: Fecha no definida',
          success: 'Compra actualizada exitosamente',
          deleted: 'Compra eliminada porque no tenía productos',
          error: 'Error al actualizar la compra',
        }}
        onSuccess={onSuccess}
        onItemUpdated={onItemUpdated}
        onItemDeleted={onItemDeleted}
      />
    ),
  },
  buildInitialDateRangeFilters(),
)

export const purchasePageConfig = {
  ...basePurchasePageConfig,
  renderHeaderActions: () => <ScanFormButton />,
}
