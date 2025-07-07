import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/dropdown/DropdownMenu'
import { useState } from 'react'
import { Modal } from '../../components/modal/Modal'
import Product from '../../../types/Product'
import { productService } from '../../../services/ProductService'
import { useServerPagination } from '../../../hooks/useServerPagination'
import Pagination from '../../components/pagination/Pagination'

const headersTable = [
    'Nombre',
    'Existencia en KG',
    'Codigo',
    'Acciones',
]

export default function ProductsTable() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product>({} as Product)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    // Usar paginación del servidor
    const {
        data: products,
        loading,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        goToPage,
        setItemsPerPage,
        refresh
    } = useServerPagination({
        fetchFunction: productService.getAllPaginated.bind(productService),
        initialPage: 1, initialLimit: 10,
    })

    const handleDelete = async (id: number) => {
        try {
            console.log(`Deleting product with id: ${id}`)
            await productService.delete(id)
            refresh() // Refresca los datos de la página actual
            setIsDeleteConfirmOpen(false)
        } catch (error) {
            console.error('Error al eliminar el producto', error)
            alert('Error al eliminar el producto')
        }
    }

    const editProduct = async (id: number) => {
        try {
            await productService.update(id, selectedProduct)
            refresh() // Refresca los datos de la página actual
            setIsEditModalOpen(false)
        } catch (error) {
            console.error('Error al actualizar el producto', error)
            alert('Error al actualizar el producto')
        }
    }

    // Loading state
    if (loading) {
        return <div className='p-4 text-center'>Cargando productos...</div>
    }

    // Error state
    if (error) {
        return (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md text-red-600'>
                <p className='font-medium'>Error al cargar productos:</p>
                <p>{error}</p>
                <button
                    className='mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm'
                    onClick={() => refresh()}>
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <section className='px-2 py-4 overflow-x-auto sm:overflow-visible'>

            <table className='w-full border border-gray-50 rounded-xl table-auto text-sm sm:text-base'>
                <thead>
                    <tr className='bg-gray-50 text-left text-gray-600 uppercase text-xs sm:text-sm'>
                        {headersTable.map((header) => (
                            <th key={'ProductHeader' + header} className='p-2'>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='bg-white sectionide-y sectionide-gray-200'>
                    {products.map((p) => (
                        <tr key={p.id} className='text-sm sm:text-base'>
                            <td className='p-2 whitespace-nowrap'>{p.name}</td>
                            <td className='p-2 whitespace-nowrap'>{p.stock}</td>
                            <td className='p-2 whitespace-nowrap'>{p.code}</td>
                            <td className='p-2 cursor-pointer text-center'>
                                {/* Edit */}
                                <DropdownMenu>
                                    {isOpen && selectedProduct.id === p.id && (
                                        <button
                                            className='fixed inset-0 z-0 w-full h-full bg-transparent cursor-default'
                                            onClick={() => {
                                                setIsOpen(false)
                                            }}>
                                            <span className='sr-only'>
                                                Cerrar menú
                                            </span>
                                        </button>
                                    )}
                                    <DropdownMenuTrigger
                                        onClick={() => {
                                            setIsOpen(!isOpen)
                                            setSelectedProduct(p)
                                        }}
                                        className='focus:outline-none hover:bg-gray-100 rounded-2xl px-4 py-1 text-center'>
                                        <MoreHorizontal className='h-4 w-4 ' />
                                        <span className='sr-only'>Abrir menú</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        isOpen={
                                            isOpen && selectedProduct.id === p.id
                                        }>
                                        <DropdownMenuItem
                                            className='text-blue-600 hover:text-blue-800'
                                            onClick={() => {
                                                setSelectedProduct(p)
                                                setIsEditModalOpen(true)
                                                setIsOpen(false)
                                            }}>
                                            <Pencil className='mr-2 h-4 w-4' />
                                            <p>Editar</p>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='text-red-600'
                                            onClick={() => {
                                                setIsDeleteConfirmOpen(true)
                                                setIsOpen(false)
                                            }}>
                                            <Trash2 className='mr-2 h-4 w-4' />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}>
                <h2 className='text-xl font-semibold mb-4'>Editar Producto</h2>
                <form>
                    <section className='mb-4'>
                        <label
                            htmlFor='name'
                            className='block text-sm font-medium text-gray-700'>
                            Nombre
                        </label>
                        <input
                            id='name'
                            name='name'
                            type='text'
                            value={selectedProduct.name}
                            onChange={(e) =>
                                setSelectedProduct({
                                    ...selectedProduct,
                                    name: e.target.value,
                                })
                            }
                            className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>
                    <section className='mb-4'>
                        <label
                            htmlFor='code'
                            className='block text-sm font-medium text-gray-700'>
                            Código
                        </label>
                        <input
                            id='code'
                            name='code'
                            type='text'
                            value={selectedProduct.code}
                            onChange={(e) =>
                                setSelectedProduct({
                                    ...selectedProduct,
                                    code: e.target.value,
                                })
                            }
                            className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>

                    <section className='flex justify-end'>
                        <button
                            type='button'
                            onClick={() => setIsEditModalOpen(false)}
                            className='mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                            Cancelar
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => selectedProduct.id && editProduct(selectedProduct.id)}
                            type='submit'
                            className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                            Guardar
                        </button>
                    </section>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}>
                <h2 className='text-xl font-semibold mb-4'>
                    Confirmar Eliminación de Producto
                </h2>
                <p className='mb-4'>
                    ¿Estás seguro de que deseas eliminar el producto{' '}
                    <p className='font-semibold text-red-600 inline-block'>
                        {selectedProduct.name}
                    </p>
                    ?
                </p>
                <section className='flex justify-end'>
                    <button
                        type='button'
                        onClick={() => setIsDeleteConfirmOpen(false)}
                        className='mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                        Cancelar
                    </button>
                    <button
                        disabled={loading}
                        type='button'
                        onClick={() =>
                            selectedProduct.id && handleDelete(selectedProduct.id)
                        }
                        className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
                        Eliminar
                    </button>
                </section>
            </Modal>
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                onItemsPerPageChange={setItemsPerPage}
            />
        </section>
    )
}
