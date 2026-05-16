export default interface NavItem {
    title: string
    href: string
    icon: React.ReactNode
    category?: string
    accent?: 'indigo' | 'rose' | 'blue' | 'emerald' | 'amber' | 'violet' | 'teal'
}
