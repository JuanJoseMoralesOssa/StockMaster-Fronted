import { useState } from 'react'
import { useApiRequest } from '@/hooks/useApiRequest'
import { Alert, Button, Input, Label } from '@/components/ui'
import { todayBogota, toDateInputValue } from '@/utils/date'
import DocumentDetailsTable from '@/pages/components/common/DocumentDetailsTable'
import type { DocumentDetailLike, DocumentLike } from '@/types/DocumentBase'
import { extractErrorInfo } from '@/utils/error'
import {
    DetailFieldKey,
    DetailValidationErrors,
    formatDetailValidationMessage,
    getDetailValidationKey,
    validateDocumentDetails,
} from './documentDetailsValidation'

type DetailWithRelations = DocumentDetailLike & {
    product?: { id?: number | string }
    person?: { id?: number | string }
}

function normalizeDetailForSubmit<TDetail extends DocumentDetailLike>(detail: TDetail): TDetail {
    const detailWithRelations = detail as DetailWithRelations
    const productId = Number(detailWithRelations.product?.id ?? detail.productId)
    const personId = Number(detailWithRelations.person?.id ?? detail.personId)
    const weight = Number(detail.weight_kg)

    return {
        ...detail,
        productId: Number.isFinite(productId) ? productId : 0,
        personId: Number.isFinite(personId) ? personId : 0,
        weight_kg: Number.isFinite(weight) ? weight : 0,
    }
}

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
    const [validationErrors, setValidationErrors] = useState<DetailValidationErrors>({})
    const [validationMessage, setValidationMessage] = useState('')
    const [hasValidatedDetails, setHasValidatedDetails] = useState(false)
    const [submitError, setSubmitError] = useState('')

    const { loading, execute } = useApiRequest(
        (data: TDoc) => service.createWithDetails(data),
        {
            successMessage,
            errorMessage,
            showSuccessToast: true,
            throwOnError: true,
            onSuccess: (response) => {
                onCreated(response)
                onSuccess()
            },
        },
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (loading) return

        const visibleDetails = details
            .filter((detail) => !detail.toDelete)
            .map(normalizeDetailForSubmit)
        if (visibleDetails.length === 0) {
            onSuccess()
            return
        }

        const validation = validateDocumentDetails(visibleDetails)
        setHasValidatedDetails(true)
        if (!validation.isValid) {
            setValidationErrors(validation.errors)
            setValidationMessage(validation.message)
            return
        }

        setValidationErrors({})
        setValidationMessage('')
        setSubmitError('')

        const docToSubmit = { ...doc }
        ;(docToSubmit as Partial<Record<K, TDetail[]>>)[detailsKey] = visibleDetails

        try {
            const response = await execute(docToSubmit)
            if (response === null) {
                setSubmitError(errorMessage)
            }
        } catch (error) {
            const { message } = extractErrorInfo(error)
            setSubmitError(message || errorMessage)
        }
    }

    const handleDetailsChange = (nextDetails: TDetail[]) => {
        setDetails(nextDetails)
        const visibleDetails = nextDetails.filter((detail) => !detail.toDelete)
        if (visibleDetails.length === 0) {
            setValidationErrors({})
            setValidationMessage('')
            setHasValidatedDetails(false)
            return
        }

        if (hasValidatedDetails) {
            const validation = validateDocumentDetails(visibleDetails)
            setValidationErrors(validation.errors)
            setValidationMessage(validation.message)
        }
    }

    const handleDetailValidationChange = (detail: TDetail, index: number, field: DetailFieldKey, hasError: boolean) => {
        if (!hasValidatedDetails) return

        setValidationErrors((currentErrors) => {
            const key = getDetailValidationKey(detail, index)
            const rowErrors = currentErrors[key] ?? {}
            if (rowErrors[field] === hasError) return currentErrors

            const nextRowErrors = { ...rowErrors }
            if (hasError) {
                nextRowErrors[field] = true
            } else {
                delete nextRowErrors[field]
            }

            const nextErrors = { ...currentErrors }
            if (Object.keys(nextRowErrors).length > 0) {
                nextErrors[key] = nextRowErrors
            } else {
                delete nextErrors[key]
            }

            const visibleDetails = details.filter((row) => !row.toDelete)
            setValidationMessage(formatDetailValidationMessage(nextErrors, visibleDetails))
            return nextErrors
        })
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
            {validationMessage && (
                <Alert variant='warning' title='Completa los detalles'>
                    {validationMessage}
                </Alert>
            )}
            {submitError && (
                <Alert variant='danger' title='No se pudo crear el documento'>
                    {submitError}
                </Alert>
            )}
            <DocumentDetailsTable<TDetail>
                details={details}
                setDetails={handleDetailsChange}
                mode='add'
                title={detailsTitle}
                validationErrors={validationErrors}
                onDetailValidationChange={handleDetailValidationChange}
            />
        </form>
    )
}
