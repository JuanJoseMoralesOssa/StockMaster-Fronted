import { useParams } from 'react-router'

function DashboardContent() {
    const { url } = useParams()

    return (
        <section>
            DashboardContent
            {url == '/products' && <h2>Productos</h2>}
        </section>
    )
}

export default DashboardContent
