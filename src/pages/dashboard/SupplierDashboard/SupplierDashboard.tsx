import { useState, useEffect } from 'react'
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Calendar } from '@/components/ui/calendar'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { format } from 'lodash'

const SupplierDashboard = () => {
    // Fechas de filtro
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [showStartCalendar, setShowStartCalendar] = useState(false)
    const [showEndCalendar, setShowEndCalendar] = useState(false)

    // Datos de ejemplo (en una aplicación real, estos vendrían de una API)
    const [data, setData] = useState({
        suppliers: [],
        expenses: [],
        purchases: [],
        loading: true,
    })

    // Datos calculados para el reporte
    const [reportData, setReportData] = useState([])

    // Función para simular la carga de datos
    useEffect(() => {
        // Simulación de datos para demostración
        const mockData = {
            suppliers: [
                { id: 1, name: 'Proveedor A' },
                { id: 2, name: 'Proveedor B' },
                { id: 3, name: 'Proveedor C' },
            ],
            expenses: [
                {
                    id: 1,
                    date: '2025-03-15T10:00:00.000Z',
                    expense_details: [
                        {
                            id: 1,
                            personId: 1,
                            weight_kg: 100,
                        },
                        {
                            id: 2,
                            personId: 2,
                            weight_kg: 200,
                        },
                    ],
                },
                {
                    id: 2,
                    date: '2025-03-20T14:30:00.000Z',
                    expense_details: [
                        {
                            id: 3,
                            personId: 1,
                            weight_kg: 150,
                        },
                        {
                            id: 4,
                            personId: 3,
                            weight_kg: 120,
                        },
                    ],
                },
            ],
            purchases: [
                {
                    id: 1,
                    date: '2025-03-10T09:00:00.000Z',
                    purchase_details: [
                        {
                            id: 1,
                            price: 5000,
                            personId: 2,
                            weight_kg: 250,
                            paid: false,
                        },
                        {
                            id: 2,
                            price: 3500,
                            personId: 1,
                            weight_kg: 175,
                            paid: true,
                        },
                    ],
                },
                {
                    id: 2,
                    date: '2025-03-25T16:45:00.000Z',
                    purchase_details: [
                        {
                            id: 3,
                            price: 4200,
                            personId: 3,
                            weight_kg: 210,
                            paid: false,
                        },
                        {
                            id: 4,
                            price: 2800,
                            personId: 2,
                            weight_kg: 140,
                            paid: true,
                        },
                    ],
                },
            ],
            loading: false,
        }

        setTimeout(() => {
            setData(mockData)
        }, 1000)
    }, [])

    // Generar los datos del reporte cuando cambian las fechas o los datos
    useEffect(() => {
        if (data.loading) return

        const startTime = startDate.getTime()
        const endTime = endDate.getTime()

        // Filtrar gastos y compras por fecha
        const filteredExpenses = data.expenses.filter((expense) => {
            const expenseDate = new Date(expense.date).getTime()
            return expenseDate >= startTime && expenseDate <= endTime
        })

        const filteredPurchases = data.purchases.filter((purchase) => {
            const purchaseDate = new Date(purchase.date).getTime()
            return purchaseDate >= startTime && purchaseDate <= endTime
        })

        // Calcular totales por proveedor
        const supplierReport = data.suppliers.map((supplier) => {
            // Calcular lo pagado (de expenses)
            let totalPaid = 0
            filteredExpenses.forEach((expense) => {
                expense.expense_details.forEach((detail) => {
                    if (detail.personId === supplier.id) {
                        totalPaid += detail.price
                    }
                })
            })

            // Calcular lo que se debe (de purchases no pagadas)
            let totalOwed = 0
            filteredPurchases.forEach((purchase) => {
                purchase.purchase_details.forEach((detail) => {
                    if (detail.personId === supplier.id && !detail.paid) {
                        totalOwed += detail.price
                    }
                })
            })

            return {
                id: supplier.id,
                name: supplier.name,
                totalPaid,
                totalOwed,
                totalBalance: totalPaid - totalOwed,
            }
        })

        setReportData(supplierReport)
    }, [data, startDate, endDate])

    // Función para exportar a Excel
    const exportToExcel = () => {
        // En una aplicación real, aquí se generaría el archivo Excel
        // Para esta demostración, simplemente mostramos un mensaje
        alert('Exportando a Excel...')

        // Normalmente usarías una biblioteca como xlsx o exceljs
        // Ejemplo con exceljs (pseudocódigo):
        // const workbook = new ExcelJS.Workbook();
        // const worksheet = workbook.addWorksheet('Reporte de Proveedores');
        // worksheet.columns = [
        //   { header: 'Proveedor', key: 'name' },
        //   { header: 'Total Pagado', key: 'totalPaid' },
        //   { header: 'Total Adeudado', key: 'totalOwed' },
        //   { header: 'Balance', key: 'totalBalance' }
        // ];
        // reportData.forEach(item => worksheet.addRow(item));
        // workbook.xlsx.writeBuffer().then(buffer => {
        //   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        //   const url = URL.createObjectURL(blob);
        //   const a = document.createElement('a');
        //   a.href = url;
        //   a.download = `reporte-proveedores-${formatDate(startDate)}-${formatDate(endDate)}.xlsx`;
        //   a.click();
        // });
    }

    // Función para formatear fechas para mostrar
    const formatDate = (date) => {
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
    }

    return (
        <div className='p-4 max-w-6xl mx-auto'>
            <Card className='mb-6'>
                <CardHeader>
                    <CardTitle>Dashboard de Reportes de Proveedores</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                        <div className='flex-1'>
                            <p className='mb-2 font-medium'>Fecha de inicio:</p>
                            <Popover
                                open={showStartCalendar}
                                onOpenChange={setShowStartCalendar}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'>
                                        {formatDate(startDate)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <Calendar
                                        mode='single'
                                        selected={startDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                setStartDate(date)
                                                setShowStartCalendar(false)
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className='flex-1'>
                            <p className='mb-2 font-medium'>Fecha de fin:</p>
                            <Popover
                                open={showEndCalendar}
                                onOpenChange={setShowEndCalendar}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className='w-full justify-start'>
                                        {formatDate(endDate)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <Calendar
                                        mode='single'
                                        selected={endDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                setEndDate(date)
                                                setShowEndCalendar(false)
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className='flex items-end'>
                            <Button
                                onClick={exportToExcel}
                                className='bg-green-600 hover:bg-green-700'>
                                Exportar a Excel
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen de Proveedores</CardTitle>
                </CardHeader>
                <CardContent>
                    {data.loading ? (
                        <div className='text-center py-8'>Cargando datos...</div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='bg-gray-100'>
                                        <th className='p-2 text-left'>Proveedor</th>
                                        <th className='p-2 text-right'>
                                            Total Pagado
                                        </th>
                                        <th className='p-2 text-right'>
                                            Total Adeudado
                                        </th>
                                        <th className='p-2 text-right'>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((supplier) => (
                                        <tr key={supplier.id} className='border-t'>
                                            <td className='p-2'>{supplier.name}</td>
                                            <td className='p-2 text-right text-green-600'>
                                                ${supplier.totalPaid.toFixed(2)}
                                            </td>
                                            <td className='p-2 text-right text-red-600'>
                                                ${supplier.totalOwed.toFixed(2)}
                                            </td>
                                            <td
                                                className={`p-2 text-right ${supplier.totalBalance >= 0
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                ${supplier.totalBalance.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className='border-t font-bold bg-gray-50'>
                                        <td className='p-2'>Total</td>
                                        <td className='p-2 text-right text-green-600'>
                                            $
                                            {reportData
                                                .reduce(
                                                    (sum, item) =>
                                                        sum + item.totalPaid,
                                                    0
                                                )
                                                .toFixed(2)}
                                        </td>
                                        <td className='p-2 text-right text-red-600'>
                                            $
                                            {reportData
                                                .reduce(
                                                    (sum, item) =>
                                                        sum + item.totalOwed,
                                                    0
                                                )
                                                .toFixed(2)}
                                        </td>
                                        <td className='p-2 text-right'>
                                            $
                                            {reportData
                                                .reduce(
                                                    (sum, item) =>
                                                        sum + item.totalBalance,
                                                    0
                                                )
                                                .toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default SupplierDashboard
