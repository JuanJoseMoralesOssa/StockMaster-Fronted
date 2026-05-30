import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { Button } from '../../../components/ui'

/**
 * Entry point for the photo-scan flow. Navigates to the dedicated scan page
 * (the manual "Crear" modal stays as-is for quick entry).
 */
export default function ScanFormButton() {
  const navigate = useNavigate()

  return (
    <Button
      variant='secondary'
      onClick={() => navigate('/compras/escanear')}
      leftIcon={<Camera className='h-4 w-4' />}
      className='w-full sm:w-fit'
      title='Escanear formulario con foto'
    >
      Escanear
    </Button>
  )
}
