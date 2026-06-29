import { ReactNode } from 'react'
import { Badge } from '../components/ui'
import { GenericPageConfig } from '../types/GenericConfig'
import { formatLocalDate } from '../utils/date'
import { formatKg, toNumber } from '../utils/format'
import type { DocumentDetailLike, DocumentLike } from '../types/DocumentBase'

export interface DocumentPageDeps<
  TDocument extends DocumentLike<K, TDetail>,
  TDetail extends DocumentDetailLike,
  TFilter extends object,
  K extends string,
> {
  service: GenericPageConfig<TDocument, TFilter>['service']
  entityName: string
  entityNamePlural: string
  detailsKey: K
  renderExpandedDetails: (item: TDocument) => ReactNode
  renderFilters: GenericPageConfig<TDocument, TFilter>['renderCustomFilters']
  renderCreateForm: GenericPageConfig<TDocument, TFilter>['renderCustomForm']
  renderEditForm: GenericPageConfig<TDocument, TFilter>['renderEditForm']
  fetchForEdit?: GenericPageConfig<TDocument, TFilter>['fetchForEdit']
}

export function buildDocumentPageConfig<
  TDocument extends DocumentLike<K, TDetail>,
  TDetail extends DocumentDetailLike,
  TFilter extends object,
  K extends string,
>(
  deps: DocumentPageDeps<TDocument, TDetail, TFilter, K>,
  initialFilterState: TFilter,
): GenericPageConfig<TDocument, TFilter> {
  return {
    entityName: deps.entityName,
    entityNamePlural: deps.entityNamePlural,
    idField: 'id' as keyof TDocument,
    service: deps.service,
    initialFilterState,
    modalClassName: 'sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl',
    formFields: [
      {
        name: 'date' as keyof TDocument,
        label: 'Fecha',
        type: 'date',
        required: true,
      },
    ],
    columns: [
      {
        key: 'date',
        label: 'Fecha',
        render: (item) => formatLocalDate(item.date),
      },
      {
        key: 'total_kg',
        label: 'Total kg',
        align: 'right',
        render: (item) => {
          const total = toNumber(item.total_kg)
          return total ? `${formatKg(total)} kg` : '—'
        },
      },
      {
        key: 'products',
        label: 'Productos',
        render: (item) => {
          const details = (item[deps.detailsKey] ?? []) as TDetail[]
          const productCount = details.reduce((ids: number[], detail) => {
            if (detail.productId && !ids.includes(detail.productId)) {
              ids.push(detail.productId)
            }
            return ids
          }, []).length

          if (productCount === 0) {
            return <Badge variant='default'>Sin productos</Badge>
          }

          return (
            <Badge variant='success'>
              {productCount} producto{productCount !== 1 ? 's' : ''}
            </Badge>
          )
        },
      },
      {
        key: 'suppliers',
        label: 'Proveedores',
        render: (item) => {
          const details = (item[deps.detailsKey] ?? []) as TDetail[]
          const supplierCount = details.reduce((ids: number[], detail) => {
            if (detail.personId && !ids.includes(detail.personId)) {
              ids.push(detail.personId)
            }
            return ids
          }, []).length

          if (supplierCount === 0) {
            return <Badge variant='default'>Sin proveedores</Badge>
          }

          return (
            <Badge variant='brand'>
              {supplierCount} proveedor{supplierCount !== 1 ? 'es' : ''}
            </Badge>
          )
        },
      },
    ],
    actions: {
      canEdit: true,
      canDelete: true,
    },
    renderCustomFilters: deps.renderFilters,
    renderCustomForm: deps.renderCreateForm,
    renderEditForm: deps.renderEditForm,
    fetchForEdit: deps.fetchForEdit,
    expandableConfig: {
      renderExpandedContent: deps.renderExpandedDetails,
    },
  }
}
