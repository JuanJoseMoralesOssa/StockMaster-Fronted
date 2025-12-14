
interface HeaderTitleProps {
  title: string
  className?: string
}

function HeaderTitle({
  title,
  className
}: Readonly<HeaderTitleProps>) {
  return (
    <h2 className={`text-3xl font-bold tracking-tight ${className}`}>{title}</h2>
  )
}

export default HeaderTitle
