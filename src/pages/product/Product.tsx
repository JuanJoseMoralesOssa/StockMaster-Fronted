import GenericPage from '../generic_page/GenericPage'
import Product from '../../types/Product'
import { productService } from '../../services/ProductService'
import { useApiRequest } from '../../hooks/useApiRequest'
import { ProductFilters, productPageConfig } from '../../config/productPageConfig'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function ProductPage() {
    const navigate = useNavigate()
    // Wrap CRUD operations with useApiRequest to get toast + error handling
    // Use flexible args typing to match ApiService signatures
    const createReq = useApiRequest<Product, [Partial<Product>]>(
        (data) => productService.create(data as Omit<Product, 'id'>),
        { successMessage: 'Producto creado exitosamente', showSuccessToast: true }
    )

    const updateReq = useApiRequest<Product, [number | string, Partial<Product>]>(
        (id, data) => productService.update(Number(id), data as Product),
        { successMessage: 'Producto actualizado', showSuccessToast: true }
    )

    const updatePartialReq = useApiRequest<Product, [number | string, Partial<Product>]>(
        (id, data) => productService.updatePartial(Number(id), data),
        { successMessage: 'Producto actualizado', showSuccessToast: true }
    )

    const deleteReq = useApiRequest<void, [number | string]>(
        (id) => productService.delete(Number(id)),
        { successMessage: 'Producto eliminado', showSuccessToast: true }
    )

    const createServiceHooks = (service: unknown) => {
        const svc = service as typeof productService
        return {
            getAllPaginated: svc.getAllPaginated.bind(svc),
            create: async (data: Partial<Product>) => {
                const res = await createReq.execute(data)
                if (!res) throw new Error('No se pudo crear el producto')
                return res
            },
            update: async (id: number | string, data: Partial<Product>) => {
                const res = await updateReq.execute(Number(id), data)
                if (!res) throw new Error('No se pudo actualizar el producto')
                return res
            },
            updatePartial: async (id: number | string, data: Partial<Product>) => {
                const res = await updatePartialReq.execute(Number(id), data)
                if (!res) throw new Error('No se pudo actualizar el producto')
                return res
            },
            delete: async (id: number | string) => {
                const res = await deleteReq.execute(Number(id))
                if (res === null) throw new Error('No se pudo eliminar el producto')
            }
        }
    }

    const pageConfig = useMemo(() => ({
        ...productPageConfig,
        actions: {
            ...productPageConfig.actions,
            customActions: productPageConfig.actions?.customActions?.map((action) => (
                action.label === 'Ver Kardex'
                    ? {
                        ...action,
                        onClick: (product: Product) => {
                            if (!product.id) return
                            const params = new URLSearchParams({
                                productId: product.id.toString(),
                                productName: product.name,
                            })
                            navigate(`/kardex?${params.toString()}`)
                        },
                    }
                    : action
            )),
        },
    }), [navigate])

    return (
        <GenericPage<Product, ProductFilters> config={pageConfig} serviceHooksFactory={createServiceHooks}>
            <GenericPage.Header config={pageConfig} />
            <GenericPage.Filters config={pageConfig} />
            <GenericPage.Table config={pageConfig} />
            <GenericPage.DetailsModal config={pageConfig} />
        </GenericPage>
    )
}

export default ProductPage
