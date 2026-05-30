export default interface NavItem {
    title: string
    href: string
    icon: React.ReactNode
    category?: string
    accent?: 'indigo' | 'rose' | 'blue' | 'emerald' | 'amber' | 'violet' | 'teal'
    /** Roles que pueden ver este enlace. Si se omite, lo ven todos los autenticados. */
    roles?: string[]
}
