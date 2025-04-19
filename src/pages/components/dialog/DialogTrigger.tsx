import { ReactNode } from 'react'

interface DialogTriggerProps {
    children: ReactNode
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const DialogTrigger = ({ children, setOpen }: DialogTriggerProps) => {
    return <button onClick={() => setOpen(true)}>{children}</button>
}
