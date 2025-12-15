import { ReactNode, ButtonHTMLAttributes } from "react"

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
}

function PrimaryButton({ icon, children, className, type = "button", ...rest }: PrimaryButtonProps) {
  const defaultClass = 'flex items-center justify-center gap-2 p-2 border rounded-lg text-white bg-blue-500 border-gray-50 hover:bg-blue-600 hover:border-gray-800 transition-colors'
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
