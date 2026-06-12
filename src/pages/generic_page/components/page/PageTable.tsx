import { useMemo } from 'react'
import { useGenericPageContext } from './PageContext'
import GenericTable from '../generic_table/GenericTable'
import { GenericPageConfig } from '../../../../types/GenericConfig'
import { Eye } from 'lucide-react'

interface PageTableProps<T, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  config: GenericPageConfig<T, TFilter, CreateInput, UpdateInput>
}

export default function PageTable<T extends object, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>>({
  config
}: PageTableProps<T, TFilter, CreateInput, UpdateInput>) {
  const { setSelectedItemForDetail } = useGenericPageContext<T, TFilter>()

  const actions = useMemo(() => {
    const baseActions = { ...config.actions }
    if (config.detailConfig) {
      const viewAction = {
        icon: <Eye className="w-4 h-4" />,
        label: 'Ver Detalles',
        onClick: (item: T) => setSelectedItemForDetail(item),
      }
      baseActions.customActions = baseActions.customActions
        ? [viewAction, ...baseActions.customActions]
        : [viewAction]
    }
    return baseActions
  }, [config.actions, config.detailConfig, setSelectedItemForDetail])

  return (
    <GenericTable<T>
      columns={config.columns}
      rowClassName={config.rowClassName}
      actions={actions}
      idField={config.idField}
      entityName={config.entityName}
      formFields={config.formFields}
      prepareDataForSubmit={config.prepareDataForSubmit}
      modalClassName={config.modalClassName}
      expandableConfig={config.expandableConfig}
      renderEditForm={config.renderEditForm}
      fetchForEdit={config.fetchForEdit}
    />
  )
}
