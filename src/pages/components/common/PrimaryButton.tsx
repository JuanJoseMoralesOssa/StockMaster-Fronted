import { ReactNode, ButtonHTMLAttributes } from "react"

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
}

function PrimaryButton({ icon, children, className, type = "button", ...rest }: PrimaryButtonProps) {
  const defaultClass = 'flex items-center justify-center gap-2 p-2 border rounded-lg text-white bg-primary border-gray-50 hover:bg-primary-hover hover:border-gray-800 transition-colors'
  return (
    <button
      type={type}
      className={className ?? defaultClass}
      {...rest}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

export default PrimaryButton
