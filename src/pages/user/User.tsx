import GenericPage from '../generic_page/GenericPage'
import { userPageConfig } from '../../config/userPageConfig'
import User from '../../types/User'

function UserPage() {
    return <GenericPage<User> config={userPageConfig} />
}

export default UserPage
