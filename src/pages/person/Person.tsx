import GenericPage from '../generic_page/GenericPage'
import Person from '../../types/Person'
import { personPageConfig } from '../../config/personPageConfig'
import { personService } from '../../services/PersonService'
import { useApiRequest } from '../../hooks/useApiRequest'

function PersonPage() {
    const createReq = useApiRequest<Person, [Partial<Person>]>(
        (data) => personService.create(data as Omit<Person, 'id'>),
        { successMessage: 'Proveedor creado exitosamente', showSuccessToast: true }
    )

    const updateReq = useApiRequest<Person, [number | string, Partial<Person>]>(
        (id, data) => personService.update(Number(id), data as Person),
        { successMessage: 'Proveedor actualizado', showSuccessToast: true }
    )

    const updatePartialReq = useApiRequest<Person, [number | string, Partial<Person>]>(
        (id, data) => personService.updatePartial(Number(id), data),
        { successMessage: 'Proveedor actualizado', showSuccessToast: true }
    )

    const deleteReq = useApiRequest<void, [number | string]>(
        (id) => personService.delete(Number(id)),
        { successMessage: 'Proveedor eliminado', showSuccessToast: true }
    )

    const createServiceHooks = (service: unknown) => {
        const svc = service as typeof personService
        return {
            getAllPaginated: svc.getAllPaginated.bind(svc),
            create: async (data: Partial<Person>) => {
                const res = await createReq.execute(data)
                if (!res) throw new Error('No se pudo crear el proveedor')
                return res
            },
            update: async (id: number | string, data: Partial<Person>) => {
                const res = await updateReq.execute(Number(id), data)
                if (!res) throw new Error('No se pudo actualizar el proveedor')
                return res
            },
            updatePartial: async (id: number | string, data: Partial<Person>) => {
                const res = await updatePartialReq.execute(Number(id), data)
                if (!res) throw new Error('No se pudo actualizar el proveedor')
                return res
            },
            delete: async (id: number | string) => {
                const res = await deleteReq.execute(Number(id))
                if (res === null) throw new Error('No se pudo eliminar el proveedor')
            }
        }
    }

    return (
        <GenericPage<Person> config={personPageConfig} serviceHooksFactory={createServiceHooks}>
            <GenericPage.Header config={personPageConfig} />
            <GenericPage.Filters config={personPageConfig} />
            <GenericPage.Table config={personPageConfig} />
            <GenericPage.DetailsModal config={personPageConfig} />
        </GenericPage>
    )
}

export default PersonPage
