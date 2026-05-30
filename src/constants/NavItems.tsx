import NavItem from '../types/NavItem'
import { Roles } from '../enums/Roles'
import {
    BarChart3,
    Users,
    Package,
    ClipboardList,
    DollarSign,
    User,
    ClipboardCheck,
    // Box,
    // Tags,
    // Truck,
} from 'lucide-react'

// Dashboard, Usuarios y Kardex: solo Oficina y Admin (Operador no los ve).
const OFFICE_ADMIN = [Roles.OFFICE, Roles.ADMIN]

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/',
        icon: <BarChart3 className='h-5 w-5' />,
        category: 'Principal',
        accent: 'indigo',
        roles: OFFICE_ADMIN,
    },
    {
        title: 'Usuarios',
        href: '/usuarios',
        icon: <Users className='h-5 w-5' />,
        category: 'Principal',
        accent: 'rose',
        roles: OFFICE_ADMIN,
    },
    {
        title: 'Kardex',
        href: '/kardex',
        icon: <ClipboardCheck className='h-5 w-5' />,
        category: 'Operaciones',
        accent: 'emerald',
        roles: OFFICE_ADMIN,
    },
    {
        title: 'Compras',
        href: '/compras',
        icon: <ClipboardList className='h-5 w-5' />,
        category: 'Operaciones',
        accent: 'blue',
    },
    {
        title: 'Consumos',
        href: '/gastos',
        icon: <DollarSign className='h-5 w-5' />,
        category: 'Operaciones',
        accent: 'amber',
    },
    {
        title: 'Proveedores',
        href: '/personas',
        icon: <User className='h-5 w-5' />,
        category: 'Operaciones',
        accent: 'violet',
    },
    {
        title: 'Productos',
        href: '/productos',
        icon: <Package className='h-5 w-5' />,
        category: 'Operaciones',
        accent: 'teal',
    },
]

export default navItems
