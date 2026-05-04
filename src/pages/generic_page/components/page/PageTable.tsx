import { useMemo } from 'react'
import { useGenericPageContext } from './PageContext'
import GenericTable from '../generic_table/GenericTable'
import { GenericPageConfig } from '../../../../types/GenericConfig'
import { Eye } from 'lucide-react'

interface PageTableProps<T, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  config: GenericPageConfig<T, TFilter, CreateInput, UpdateInput>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PageTable<T extends object, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>>({
  config
}: PageTableProps<T, TFilter, CreateInput, UpdateInput>) {
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
    updateItem,
    removeItem,
    retry,
    handleUpdate,
    handleDelete,
    setSelectedItemForDetail
  } = useGenericPageContext<T, TFilter>()

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
      data={data}
      loading={loading}
      error={error}
      retry={retry}
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
      rowClassName={config.rowClassName}
      actions={actions}
      idField={config.idField}
      entityName={config.entityName}
      onDelete={handleDelete}
      onUpdate={handleUpdate}
      formFields={config.formFields}
      prepareDataForSubmit={config.prepareDataForSubmit}
      expandableConfig={config.expandableConfig}
      renderEditForm={config.renderEditForm}
    />
  )
}
