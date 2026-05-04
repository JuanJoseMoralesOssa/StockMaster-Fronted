import { useGenericPageContext } from './PageContext'
import { Modal } from '../../../components/modal/Modal'
import { GenericPageConfig } from '../../../../types/GenericConfig'

interface PageDetailsModalProps<T, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  config: GenericPageConfig<T, TFilter, CreateInput, UpdateInput>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PageDetailsModal<T extends object, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>>({
  config
}: PageDetailsModalProps<T, TFilter, CreateInput, UpdateInput>) {
  const { selectedItemForDetail, setSelectedItemForDetail } = useGenericPageContext<T, TFilter>()

  if (!config.detailConfig) return null

  return (
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
  )
}
