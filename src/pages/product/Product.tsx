import GenericPage from '../generic_page/GenericPage'
import { productPageConfig } from '../../config/productPageConfig'
import Product from '../../types/Product'

function ProductPage() {
    return <GenericPage<Product> config={productPageConfig} />
}

export default ProductPage
