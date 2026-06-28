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

// Los endpoints operativos hoy solo aceptan Oficina/Admin; Operador queda
// limitado a autenticarse hasta que producto defina sus permisos.
const OFFICE_ADMIN: string[] = [Roles.OFFICE, Roles.ADMIN]

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
        roles: OFFICE_ADMIN,
    },
    {
        title: 'Pagos',
        href: '/pagos',
        icon: <DollarSign className='h-5 w-5' />,
        category: 'Operaciones',
        accent: 'amber',
        roles: OFFICE_ADMIN,
    },
    {
        title: 'Proveedores',
        href: '/personas',
        icon: <User className='h-5 w-5' />,
        category: 'Operaciones',
        accent: 'violet',
        roles: OFFICE_ADMIN,
    },
    {
        title: 'Productos',
        href: '/productos',
        icon: <Package className='h-5 w-5' />,
        category: 'Operaciones',
        accent: 'teal',
        roles: OFFICE_ADMIN,
    },
]

export default navItems
