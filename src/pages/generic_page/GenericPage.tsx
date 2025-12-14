import { useServerPagination } from '../../hooks/useServerPagination'
import GenericHeader from './components/GenericHeader'
import GenericTable from './components/GenericTable'
import GenericForm from './components/GenericForm'
import { GenericPageConfig } from '../../types/GenericConfig'

interface GenericPageProps<T> {
  config: GenericPageConfig<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GenericPage<T extends Record<string, any>>({ config }: GenericPageProps<T>) {
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
    addItem,
    updateItem,
    removeItem
  } = useServerPagination<T>({
    fetchFunction: config.service.getAllPaginated.bind(config.service),
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

    const updatedItem = await config.service.update.call(config.service, id, dataToSubmit)
    return updatedItem
  }

  return (
    <section>
      <GenericHeader<T>
        title={config.entityNamePlural}
        createButtonText={`Nuevo ${config.entityName}`}
        modalTitle={`Crear ${config.entityName}`}
        modalDescription={`Completa los detalles del ${config.entityName}. Los campos marcados con * son requeridos.`}
        onItemCreated={addItem}
        renderCreateForm={(onSuccess, onItemCreated) => (
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
        actions={config.actions}
        idField={config.idField}
        entityName={config.entityName}
        onDelete={config.service.delete.bind(config.service)}
        onUpdate={handleUpdate}
        formFields={config.formFields}
        prepareDataForSubmit={config.prepareDataForSubmit}
      />
    </section>
  )
}

export default GenericPage
