import { describe, expect, it, vi } from 'vitest'
import { buildDocumentPageConfig } from './documentPageConfig'

type TestDetail = {
  id?: number
  productId?: number
  personId?: number
  toDelete?: boolean
}

type TestDocument = {
  id?: number
  date: string
  total_kg?: number
  test_details?: TestDetail[]
}

type TestFilters = {
  activeDate: boolean
  startDate: string
  endDate: string
  personId: string
  productId: string
}

describe('buildDocumentPageConfig', () => {
  it('builds a config with required table and expandable settings', () => {
    const baseService = {
      getAllPaginated: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updatePartial: vi.fn(),
      delete: vi.fn(),
      getAllPaginatedFiltered: vi.fn(),
    }

    const config = buildDocumentPageConfig<TestDocument, TestDetail, TestFilters, 'test_details'>(
      {
        service: baseService,
        entityName: 'Documento',
        entityNamePlural: 'Documentos',
        detailsKey: 'test_details',
        renderExpandedDetails: () => null,
        renderFilters: () => null,
        renderCreateForm: () => null,
        renderEditForm: () => null,
      },
      {
        activeDate: false,
        startDate: '',
        endDate: '',
        personId: '',
        productId: '',
      },
    )

    expect(config.idField).toBe('id')
    expect(config.columns).toHaveLength(4)
    expect(config.columns.map((column) => column.label)).toEqual([
      'Fecha',
      'Total kg',
      'Productos',
      'Proveedores',
    ])
    expect(config.expandableConfig).toBeDefined()
    expect(typeof config.expandableConfig?.renderExpandedContent).toBe('function')
  })
})
