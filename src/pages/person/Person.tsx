import { PersonService } from '../../services/PersonService'
import { useServerPagination } from '../../hooks/useServerPagination'
import PersonsHeader from './components/PersonsHeader'
import PersonsTable from './components/PersonsTable'

const personService = new PersonService()

function Person() {
    const {
        data: people,
        loading,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        goToPage,
        setItemsPerPage,
        refresh,
        addItem,
        updateItem,
        removeItem
    } = useServerPagination({
        fetchFunction: personService.getAllPaginated.bind(personService),
        initialPage: 1,
        initialLimit: 10,
    })

    return (
        <section>
            <PersonsHeader onPersonCreated={addItem} />
            <PersonsTable
                people={people}
                loading={loading}
                error={error}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                goToPage={goToPage}
                setItemsPerPage={setItemsPerPage}
                refresh={refresh}
                updateItem={updateItem}
                removeItem={removeItem}
            />
        </section>
    )
}

export default Person
