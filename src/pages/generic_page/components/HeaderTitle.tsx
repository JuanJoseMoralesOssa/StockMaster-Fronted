
interface HeaderTitleProps {
  title: string
  className?: string
}

function HeaderTitle({
  title,
  className
}: Readonly<HeaderTitleProps>) {
  return (
    <h2 className={`text-2xl font-semibold tracking-tight text-(--color-text-primary) md:text-3xl ${className ?? ''}`}>{title}</h2>
  )
}

export default HeaderTitle
