import { useEffect } from 'react'
import { useProductStore } from '../../../stores/useProductStore'
import { useSupplierStore } from '../../../stores/useSupplierStore'

export default function useExpensesTable() {
    const products = useProductStore(state => state.products)
    const suppliers = useSupplierStore(state => state.suppliers)
    const fetchProducts = useProductStore(state => state.fetchProducts)
    const fetchSuppliers = useSupplierStore(state => state.fetchSuppliers)

    useEffect(() => {
        fetchProducts()
        fetchSuppliers()
    }, [fetchProducts, fetchSuppliers])

    return { products, suppliers }
}
