import React, { useState, Dispatch, SetStateAction, ReactElement } from 'react'

interface DialogChildProps {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
}

interface DialogProps {
    className?: string
    children: ReactElement<DialogChildProps> | ReactElement<DialogChildProps>[]
}

export const Dialog = ({ children, className }: DialogProps) => {
    const [open, setOpen] = useState(false)

    return (
        <section className={className}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { open, setOpen })
                }
                return child
            })}
        </section>
    )
}
