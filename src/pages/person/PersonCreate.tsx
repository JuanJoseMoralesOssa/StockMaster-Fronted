import { useState } from 'react'
import Person from '../../types/Person'
import { personService } from '../../services/PersonService'
import { useApiRequest } from '../../hooks/useApiRequest'
import { Button, FieldGroup, Input } from '../../components/ui'

interface PersonCreateProps {
    onSuccess?: () => void
    onPersonCreated?: (newPerson: Person) => void
}

const PersonCreate = ({ onSuccess, onPersonCreated }: PersonCreateProps) => {
    const [person, setPerson] = useState<Person>({
        name: '',
    })

    const { loading, execute } = useApiRequest(
        (data: Partial<Person>) => personService.create(data),
        {
            successMessage: 'Proveedor creado exitosamente',
            errorMessage: 'Error al crear el proveedor',
            showSuccessToast: true,
            onSuccess: (newPerson) => {
                if (onPersonCreated) {
                    onPersonCreated(newPerson)
                }
                setPerson({ name: '' })
                if (onSuccess) {
                    onSuccess()
                }
            }
        }
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPerson({ ...person, [name]: value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await execute(person)
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 px-2 overflow-auto' noValidate>
            <FieldGroup label='Nombre del proveedor' required>
                <Input
                    type='text'
                    name='name'
                    autoComplete='organization'
                    value={person.name}
                    onChange={handleChange}
                    placeholder='Ingresa el nombre del proveedor'
                    required
                />
            </FieldGroup>

            <section className='flex w-full sm:justify-end'>
                <Button type='submit' loading={loading} variant='primary' className='w-full md:w-fit'>
                    Guardar
                </Button>
            </section>
        </form>
    )
}

export default PersonCreate
