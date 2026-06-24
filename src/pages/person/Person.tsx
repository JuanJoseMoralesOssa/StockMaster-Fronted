import GenericPage from '../generic_page/GenericPage'
import Person from '../../types/Person'
import { personPageConfig } from '../../config/personPageConfig'
import { PersonFilters, personService } from '../../services/PersonService'
import { useApiRequest } from '../../hooks/useApiRequest'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function PersonPage() {
    const navigate = useNavigate()
    const createPerson = useCallback(
        (data: Partial<Person>) => personService.create(data as Omit<Person, 'id'>),
        []
    )
    const updatePerson = useCallback(
        (id: number | string, data: Partial<Person>) => personService.update(Number(id), data as Person),
        []
    )
    const updatePersonPartial = useCallback(
        (id: number | string, data: Partial<Person>) => personService.updatePartial(Number(id), data),
        []
    )

    const createReq = useApiRequest<Person, [Partial<Person>]>(
        createPerson,
        { successMessage: 'Proveedor creado exitosamente', showSuccessToast: true }
    )

    const updateReq = useApiRequest<Person, [number | string, Partial<Person>]>(
        updatePerson,
        { successMessage: 'Proveedor actualizado', showSuccessToast: true }
    )

    const updatePartialReq = useApiRequest<Person, [number | string, Partial<Person>]>(
        updatePersonPartial,
        { successMessage: 'Proveedor actualizado', showSuccessToast: true }
    )

    const createServiceHooks = useCallback((service: unknown) => {
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
                await personService.delete(Number(id))
            }
        }
    }, [createReq.execute, updateReq.execute, updatePartialReq.execute])

    const pageConfig = useMemo(() => ({
        ...personPageConfig,
        actions: {
            ...personPageConfig.actions,
            customActions: personPageConfig.actions?.customActions?.map((action) => {
                if (action.label !== 'Ver Compras' && action.label !== 'Ver Gastos') {
                    return action
                }

                return {
                    ...action,
                    onClick: (person: Person) => {
                        if (!person.id) return
                        const params = new URLSearchParams({
                            personId: person.id.toString(),
                            personName: person.name,
                        })
                        navigate(`${action.label === 'Ver Compras' ? '/compras' : '/gastos'}?${params.toString()}`)
                    },
                }
            }),
        },
    }), [navigate])

    return (
        <GenericPage<Person, PersonFilters> config={pageConfig} serviceHooksFactory={createServiceHooks}>
            <GenericPage.Header config={pageConfig} />
            <GenericPage.Filters config={pageConfig} />
            <GenericPage.Table config={pageConfig} />
            <GenericPage.DetailsModal config={pageConfig} />
        </GenericPage>
    )
}

export default PersonPage
