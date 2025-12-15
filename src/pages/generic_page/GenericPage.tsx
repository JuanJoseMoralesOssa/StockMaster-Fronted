import { useServerPagination } from '../../hooks/useServerPagination'
import GenericHeader from './components/generic_table/GenericHeader'
import GenericTable from './components/generic_table/GenericTable'
import { GenericPageConfig } from '../../types/GenericConfig'
import GenericForm from './components/generic_form/GenericForm'
import { useState } from 'react'
import { Modal } from '../components/modal/Modal'
import { Eye } from 'lucide-react'

interface GenericPageProps<T> {
  config: GenericPageConfig<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GenericPage<T extends Record<string, any>>({ config }: GenericPageProps<T>) {
  const [filters, setFilters] = useState(config.initialFilterState || {})
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<T | null>(null)

  const {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    setItemsPerPage,
    refresh,
    refreshWithFilters,
    setActiveFilters,
    addItem,
    updateItem,
    removeItem
  } = useServerPagination<T>({
    fetchFunction: config.service.getAllPaginated.bind(config.service),
    fetchWithFilters: config.service.getAllPaginatedFiltered?.bind(config.service),
    filters,
    initialPage: 1,
    initialLimit: 10,
  })

  const handleCreate = async (formData: Partial<T>) => {
    let dataToSubmit = formData

    // Preparar datos antes de enviar si existe la función
    if (config.prepareDataForSubmit) {
      dataToSubmit = await config.prepareDataForSubmit(formData, false)
    }

    // Validar datos personalizados si existe la función
    if (config.validateData) {
      const validationError = await config.validateData(dataToSubmit)
      if (validationError) {
        throw new Error(validationError)
      }
    }

    const newItem = await config.service.create.call(config.service, dataToSubmit)
    return newItem
  }

  const handleUpdate = async (id: number | string, formData: Partial<T>) => {
    let dataToSubmit = formData

    // Preparar datos antes de enviar si existe la función
    if (config.prepareDataForSubmit) {
      dataToSubmit = await config.prepareDataForSubmit(formData, true)
    }

    // Validar datos personalizados si existe la función
    if (config.validateData) {
      const validationError = await config.validateData(dataToSubmit)
      if (validationError) {
        throw new Error(validationError)
      }
    }
    return config.updatePartial
      ? await config.service.updatePartial.call(config.service, id, dataToSubmit)
      : await config.service.update.call(config.service, id, dataToSubmit as T)
  }

  // Configurar acciones
  const actions = { ...config.actions }
  if (config.detailConfig) {
    const viewAction = {
      icon: <Eye className="w-4 h-4" />,
      label: 'Ver Detalles',
      onClick: (item: T) => setSelectedItemForDetail(item),
    }
    actions.customActions = actions.customActions
      ? [viewAction, ...actions.customActions]
      : [viewAction]
  }

  return (
    <section>
      <GenericHeader<T>
        title={config.entityNamePlural}
        createButtonText={`Nuevo ${config.entityName}`}
        modalTitle={`Crear ${config.entityName}`}
        modalDescription={`Completa los detalles del ${config.entityName}. Los campos marcados con * son requeridos.`}
        onItemCreated={addItem}
        renderCreateForm={(onSuccess: () => void, onItemCreated: (item: T) => void) => (
          config.renderCustomForm ? config.renderCustomForm(onSuccess, onItemCreated) :
            <GenericForm
              fields={config.formFields}
              onSubmit={async (data) => {
                const newItem = await handleCreate(data)
                onItemCreated(newItem)
                onSuccess()
              }}
              onCancel={onSuccess}
              submitLabel="Crear"
            />
        )}
      />

      {config.renderCustomFilters && (
        <div className="mb-4">
          {config.renderCustomFilters({
            filters,
            setFilters,
            onSearch: () => {
              setActiveFilters(true)
              refreshWithFilters(filters)
            },
            onClear: () => {
              setActiveFilters(false)
              setFilters(config.initialFilterState || {})
              goToPage(1)
            }
          })}
        </div>
      )}

      <GenericTable<T>
        data={data as T[]}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        goToPage={goToPage}
        setItemsPerPage={setItemsPerPage}
        refresh={refresh}
        updateItem={(item: T, idField?: keyof T) => updateItem(item, idField)}
        removeItem={(id: string | number, idField?: keyof T) => removeItem(id, idField)}
        columns={config.columns}
        actions={actions}
        idField={config.idField}
        entityName={config.entityName}
        onDelete={config.service.delete.bind(config.service)}
        onUpdate={handleUpdate}
        formFields={config.formFields}
        prepareDataForSubmit={config.prepareDataForSubmit}
        expandableConfig={config.expandableConfig}
        renderEditForm={config.renderEditForm}
      />

      {config.detailConfig && (
        <Modal
          open={!!selectedItemForDetail}
          onClose={() => setSelectedItemForDetail(null)}
          title={
            selectedItemForDetail && typeof config.detailConfig.title === 'function'
              ? config.detailConfig.title(selectedItemForDetail)
              : typeof config.detailConfig.title === 'string'
                ? config.detailConfig.title
                : `Detalles de ${config.entityName}`
          }
          description={config.detailConfig.description}
        >
          {selectedItemForDetail && config.detailConfig.renderContent(selectedItemForDetail)}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setSelectedItemForDetail(null)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}

export default GenericPage
