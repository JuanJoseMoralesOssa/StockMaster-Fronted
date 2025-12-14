import GenericPage from '../generic_page/GenericPage'
import { personPageConfig } from '../../config/personPageConfig'
import Person from '../../types/Person'

function PersonPage() {
    return <GenericPage<Person> config={personPageConfig} />
}

export default PersonPage
