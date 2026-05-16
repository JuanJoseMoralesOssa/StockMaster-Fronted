import { useGenericPageContext } from './PageContext'
import { Modal } from '../../../components/modal/Modal'
import { GenericPageConfig } from '../../../../types/GenericConfig'
import { Button } from '../../../../components/ui'

interface PageDetailsModalProps<T, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  config: GenericPageConfig<T, TFilter, CreateInput, UpdateInput>
}

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
        <Button
          variant="secondary"
          onClick={() => setSelectedItemForDetail(null)}
        >
          Cerrar
        </Button>
      </div>
    </Modal>
  )
}
