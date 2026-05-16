import GenericPage from '../generic_page/GenericPage'
import { userPageConfig } from '../../config/userPageConfig'
import User from '../../types/User'
import { UserFilters, userService } from '../../services/User'
import { useApiRequest } from '../../hooks/useApiRequest'

function UserPage() {
    const createReq = useApiRequest<User, [Partial<User>]>(
        (data) => userService.create(data as Omit<User, 'id'>),
        { successMessage: 'Usuario creado exitosamente', showSuccessToast: true }
    )

    const updateReq = useApiRequest<User, [number | string, Partial<User>]>(
        (id, data) => userService.update(Number(id), data as User),
        { successMessage: 'Usuario actualizado', showSuccessToast: true }
    )

    const updatePartialReq = useApiRequest<User, [number | string, Partial<User>]>(
        (id, data) => userService.updatePartial(Number(id), data),
        { successMessage: 'Usuario actualizado', showSuccessToast: true }
    )

    const deleteReq = useApiRequest<void, [number | string]>(
        (id) => userService.delete(Number(id)),
        { successMessage: 'Usuario eliminado', showSuccessToast: true }
    )

    const createServiceHooks = (service: unknown) => {
        const svc = service as typeof userService
        return {
            getAllPaginated: svc.getAllPaginated.bind(svc),
            create: async (data: Partial<User>) => {
                const res = await createReq.execute(data)
                if (!res) throw new Error('No se pudo crear el usuario')
                return res
            },
            update: async (id: number | string, data: Partial<User>) => {
                const res = await updateReq.execute(Number(id), data)
                if (!res) throw new Error('No se pudo actualizar el usuario')
                return res
            },
            updatePartial: async (id: number | string, data: Partial<User>) => {
                const res = await updatePartialReq.execute(Number(id), data)
                if (!res) throw new Error('No se pudo actualizar el usuario')
                return res
            },
            delete: async (id: number | string) => {
                const res = await deleteReq.execute(Number(id))
                if (res === null) throw new Error('No se pudo eliminar el usuario')
            }
        }
    }

    return (
        <GenericPage<User, UserFilters> config={userPageConfig} serviceHooksFactory={createServiceHooks}>
            <GenericPage.Header config={userPageConfig} />
            <GenericPage.Filters config={userPageConfig} />
            <GenericPage.Table config={userPageConfig} />
            <GenericPage.DetailsModal config={userPageConfig} />
        </GenericPage>
    )
}

export default UserPage
