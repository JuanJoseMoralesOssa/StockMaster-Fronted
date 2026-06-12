import { useState } from 'react'
import { useApiRequest } from '@/hooks/useApiRequest'
import { Button, Input, Label } from '@/components/ui'
import { todayBogota, toDateInputValue } from '@/utils/date'
import DocumentDetailsTable from '@/pages/components/common/DocumentDetailsTable'
import type { DocumentDetailLike, DocumentLike } from '@/types/DocumentBase'

interface DocumentCreateProps<TDoc, K extends string> {
    service: { createWithDetails: (doc: TDoc) => Promise<TDoc> }
    detailsKey: K
    detailsTitle: string
    successMessage: string
    errorMessage: string
    onCreated: (doc: TDoc) => void
    onSuccess: () => void
}

/**
 * Formulario genérico de creación para documentos con detalles (compras/gastos):
 * fecha + tabla de detalles + guardar vía `createWithDetails`.
 */
export default function DocumentCreate<
    K extends string,
    TDetail extends DocumentDetailLike,
    TDoc extends DocumentLike<K, TDetail>,
>({
    service,
    detailsKey,
    detailsTitle,
    successMessage,
    errorMessage,
    onCreated,
    onSuccess,
}: Readonly<DocumentCreateProps<TDoc, K>>) {
    // El documento nuevo solo necesita fecha; los detalles viven en su propio estado.
    const [doc, setDoc] = useState<TDoc>(() => ({ date: todayBogota() } as TDoc))
    const [details, setDetails] = useState<TDetail[]>([])

    const { loading, execute } = useApiRequest(
        (data: TDoc) => service.createWithDetails(data),
        {
            successMessage,
            errorMessage,
            showSuccessToast: true,
            onSuccess: (response) => {
                onCreated(response)
                onSuccess()
            },
        },
    )

    const handleSubmit = async (e: React.FormEvent) => {
        if (loading) return
        e.preventDefault()

        const docToSubmit = { ...doc }
        if (details.length > 0) {
            ;(docToSubmit as Partial<Record<K, TDetail[]>>)[detailsKey] = details
        }

        await execute(docToSubmit)
    }

    return (
        <form onSubmit={handleSubmit} className='mx-auto w-full space-y-8 py-2' noValidate>
            <section className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
                <div className='flex flex-col gap-2'>
                    <Label htmlFor='date' required>
                        Fecha
                    </Label>
                    <Input
                        type='date'
                        name='date'
                        id='date'
                        value={toDateInputValue(doc.date)}
                        required
                        onChange={(e) => setDoc({ ...doc, date: e.target.value })}
                    />
                </div>
                <Button
                    type='submit'
                    loading={loading}
                    variant='primary'
                    className='w-full sm:w-auto'
                >
                    Guardar
                </Button>
            </section>
            <DocumentDetailsTable<TDetail>
                details={details}
                setDetails={setDetails}
                mode='add'
                title={detailsTitle}
            />
        </form>
    )
}
