import GenericPage from '../generic_page/GenericPage'
import { userPageConfig } from '../../config/userPageConfig'
import User from '../../types/User'
import { UserFilters, userService } from '../../services/User'
import { useEntityCrud } from '../../hooks/useEntityCrud'

function UserPage() {
    const createServiceHooks = useEntityCrud(userService, 'Usuario')

    return (
        <GenericPage<User, UserFilters> config={userPageConfig} serviceHooksFactory={createServiceHooks}>
            <GenericPage.Header config={userPageConfig} />
            <GenericPage.Filters config={userPageConfig} />
            <GenericPage.Table config={userPageConfig} />
            <GenericPage.DetailsModal config={userPageConfig} />
        </GenericPage>
    )
}

export default UserPage
