import { ReactNode } from 'react'

interface DialogDescriptionProps {
    children: ReactNode
}

export const DialogDescription = ({ children }: DialogDescriptionProps) => {
    return <p className='text-gray-600'>{children}</p>
}
