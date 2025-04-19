import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Dialog } from '../../components/dialog/Dialog'
import { DialogTrigger } from '../../components/dialog/DialogTrigger'
import { DialogContent } from '../../components/dialog/DialogContent'
import { DialogHeader } from '../../components/dialog/DialogHeader.'
import { DialogTitle } from '../../components/dialog/DialogTitle'
import { DialogDescription } from '../../components/dialog/DialogDescription'
import KardexCreate from './KardexCreate'

function KardexesHeader() {
    const [open, setOpen] = useState(false)
    return (
        <section className='flex items-center justify-between gap-4 p-2 mr-10 md:mr-5 max-w-fit'>
            <section>
                <h2 className='text-3xl font-bold tracking-tight'>Kardex</h2>
            </section>
            <Dialog className='relative'>
                <DialogTrigger setOpen={setOpen}>
                    <section className='flex items-center justify-center gap-2 p-2 border rounded-lg text-white bg-blue-500 border-gray-50 hover:bg-gray-600 hover:border-gray-800'>
                        <Plus className='md:mr-2 h-4 w-4' />
                        <p>Nuevo Kardex</p>
                    </section>
                </DialogTrigger>
                <DialogContent
                    open={open}
                    setOpen={setOpen}
                    className='sm:max-w-fit m-auto'>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Kardex</DialogTitle>
                        <DialogDescription>
                            Completa los detalles del Kardex. Todos los campos son
                            requeridos.
                        </DialogDescription>
                    </DialogHeader>
                    <KardexCreate />
                </DialogContent>
            </Dialog>
        </section>
    )
}

export default KardexesHeader
