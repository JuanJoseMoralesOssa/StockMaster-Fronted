export default interface User {
    id?: number | string  // Allow string for temporary IDs during optimistic updates
    name: string
    email: string
    role: string
    password?: string
}
