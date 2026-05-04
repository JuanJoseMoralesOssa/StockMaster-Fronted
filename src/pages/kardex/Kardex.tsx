import GenericPage from '../generic_page/GenericPage'
import type KardexEntity from '../../types/Kardex'
import { kardexPageConfig } from '../../config/kardexPageConfig'
import { kardexService } from '../../services/KardexService'
import { useApiRequest } from '../../hooks/useApiRequest'

function KardexPage() {
    const createReq = useApiRequest<KardexEntity, [Partial<KardexEntity>]>(
        (data) => kardexService.create(data as Omit<KardexEntity, 'id'>),
        { successMessage: 'Registro de kardex creado exitosamente', showSuccessToast: true }
    )

    const updateReq = useApiRequest<KardexEntity, [number | string, Partial<KardexEntity>]>(
        (id, data) => kardexService.update(Number(id), data as KardexEntity),
        { successMessage: 'Registro de kardex actualizado', showSuccessToast: true }
    )

    const updatePartialReq = useApiRequest<KardexEntity, [number | string, Partial<KardexEntity>]>(
        (id, data) => kardexService.updatePartial(Number(id), data),
        { successMessage: 'Registro de kardex actualizado', showSuccessToast: true }
    )

    const deleteReq = useApiRequest<void, [number | string]>(
        (id) => kardexService.delete(Number(id)),
        { successMessage: 'Registro de kardex eliminado', showSuccessToast: true }
    )

    const createServiceHooks = (service: unknown) => {
        const svc = service as typeof kardexService
        return {
            getAllPaginated: svc.getAllPaginated.bind(svc),
            create: async (data: Partial<KardexEntity>) => {
                const res = await createReq.execute(data)
                if (!res) throw new Error('No se pudo crear el registro de kardex')
                return res
            },
            update: async (id: number | string, data: Partial<KardexEntity>) => {
                const res = await updateReq.execute(Number(id), data)
                if (!res) throw new Error('No se pudo actualizar el registro de kardex')
                return res
            },
            updatePartial: async (id: number | string, data: Partial<KardexEntity>) => {
                const res = await updatePartialReq.execute(Number(id), data)
                if (!res) throw new Error('No se pudo actualizar el registro de kardex')
                return res
            },
            delete: async (id: number | string) => {
                const res = await deleteReq.execute(Number(id))
                if (res === null) throw new Error('No se pudo eliminar el registro de kardex')
            }
        }
    }

    return (
        <GenericPage<KardexEntity> config={kardexPageConfig} serviceHooksFactory={createServiceHooks}>
            <GenericPage.Header config={kardexPageConfig} />
            <GenericPage.Filters config={kardexPageConfig} />
            <GenericPage.Table config={kardexPageConfig} />
            <GenericPage.DetailsModal config={kardexPageConfig} />
        </GenericPage>
    )
}

export default KardexPage
