import GenericPage from '../generic_page/GenericPage'
import Person from '../../types/Person'
import { personPageConfig } from '../../config/personPageConfig'
import { PersonFilters, personService } from '../../services/PersonService'
import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'

function PersonPage() {
    const navigate = useNavigate()
    const { showSuccess } = useToast()

    const createServiceHooks = useCallback((service: unknown) => {
        const svc = service as typeof personService
        return {
            getAllPaginated: svc.getAllPaginated.bind(svc),
            create: async (data: Partial<Person>) => {
                const created = await svc.create(data as Omit<Person, 'id'>)
                showSuccess('Proveedor creado exitosamente')
                return created
            },
            update: async (id: number | string, data: Partial<Person>) => {
                return svc.update(Number(id), data as Person)
            },
            updatePartial: async (id: number | string, data: Partial<Person>) => {
                return svc.updatePartial(Number(id), data)
            },
            delete: async (id: number | string) => {
                await svc.delete(Number(id))
            }
        }
    }, [showSuccess])

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
