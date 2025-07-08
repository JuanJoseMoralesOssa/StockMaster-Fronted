import { userService } from '../../services/User'
import { useServerPagination } from '../../hooks/useServerPagination'
import UsersHeader from './components/UsersHeader'
import UsersTable from './components/UsersTable'

function User() {
    const {
        data: users,
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
        fetchFunction: userService.getAllPaginated.bind(userService),
        initialPage: 1,
        initialLimit: 10,
    })

    return (
        <section>
            <UsersHeader onUserCreated={addItem} />
            <UsersTable
                users={users}
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

export default User
