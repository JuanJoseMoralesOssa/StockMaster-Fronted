import { ReactNode } from 'react'

interface DialogTitleProps {
    children: ReactNode
}

export const DialogTitle = ({ children }: DialogTitleProps) => {
    return <h2 className='text-xl font-semibold'>{children}</h2>
}
