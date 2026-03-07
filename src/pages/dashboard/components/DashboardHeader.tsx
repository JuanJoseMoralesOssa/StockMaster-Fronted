interface DashboardHeaderProps {
  title: string
  subtitle: string
  dateFormatted: string
}

function DashboardHeader({ title, subtitle, dateFormatted }: Readonly<DashboardHeaderProps>) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between mb-7 gap-4">
      <div>
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">{title}</h1>
        <p className="text-[13.5px] text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className="text-[12.5px] text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 font-mono shadow-sm shrink-0">
        {dateFormatted}
      </div>
    </div>
  )
}

export default DashboardHeader
