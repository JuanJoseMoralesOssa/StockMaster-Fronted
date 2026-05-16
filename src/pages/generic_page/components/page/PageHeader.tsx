import { useGenericPageContext } from './PageContext'
import GenericHeader from '../generic_table/GenericHeader'
import GenericForm from '../generic_form/GenericForm'
import { GenericPageConfig } from '../../../../types/GenericConfig'

interface PageHeaderProps<T, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  config: GenericPageConfig<T, TFilter, CreateInput, UpdateInput>
}

export default function PageHeader<T extends object, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>>({
  config
}: PageHeaderProps<T, TFilter, CreateInput, UpdateInput>) {
  const { addItem, handleCreate } = useGenericPageContext<T, TFilter>()

  return (
    <GenericHeader<T>
      title={config.entityNamePlural}
      createButtonText="Crear"
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
  )
}
