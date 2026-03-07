import NavItem from '../types/NavItem'
import {
    BarChart3,
    Users,
    Package,
    ClipboardList,
    DollarSign,
    User,
    // ClipboardCheck,
    // Box,
    // Tags,
    // Truck,
} from 'lucide-react'

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/',
        icon: <BarChart3 className='h-5 w-5' />,
        category: 'Principal',
    },
    {
        title: 'Usuarios',
        href: '/usuarios',
        icon: <Users className='h-5 w-5' />,
        category: 'Principal',
    },
    // {
    //     title: 'Kardex',
    //     href: '/kardex',
    //     icon: <ClipboardCheck className='h-5 w-5' />,
    // },
    {
        title: 'Compras',
        href: '/compras',
        icon: <ClipboardList className='h-5 w-5' />,
        category: 'Operaciones',
    },
    {
        title: 'Consumos',
        href: '/gastos',
        icon: <DollarSign className='h-5 w-5' />,
        category: 'Operaciones',
    },
    {
        title: 'Proveedores',
        href: '/personas',
        icon: <User className='h-5 w-5' />,
        category: 'Operaciones',
    },
    {
        title: 'Productos',
        href: '/productos',
        icon: <Package className='h-5 w-5' />,
        category: 'Operaciones',
    },
]

export default navItems
