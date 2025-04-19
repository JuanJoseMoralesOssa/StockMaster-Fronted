import { useState } from 'react'
import Person from '../../../types/Person'
import { personService } from '../../../services/PersonService'

// const createPerson = async (person: Person) => {
//     // Create person in the database
//     // const response = await fetch('https://api.example.com/persons', {
//     //     method: 'POST',
//     //     headers: {
//     //         'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify(person),
//     // })
//     // const data = await response.json()
//     // return data
//     await new Promise((resolve) => setTimeout(resolve, 1000))
//     console.log('Person created', person)
//     return person
// }

const PersonCreate = () => {
    const [loading, setLoading] = useState(false)
    const [person, setPerson] = useState<Person>({
        name: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPerson({ ...person, [name]: value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await personService.create(person).then((response) => {
            console.log('Person created', response)
            alert('Persona creada')
            window.location.reload()
        }).catch((error) => {
            console.error('Error al crear la persona', error)
            alert('Error al crear la persona')
        })
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 px-2 overflow-auto'>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Nombre
                </label>
                <input
                    type='text'
                    name='name'
                    id='name'
                    value={person.name}
                    required
                    onChange={handleChange}
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                />
            </section>
            <section className='flex w-full sm:justify-end'>
                <button
                    disabled={loading}
                    type='submit'
                    className='inline-flex w-full md:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    Guardar
                </button>
            </section>
        </form>
    )
}

export default PersonCreate
