import { useEffect, useMemo } from 'react'

/**
 * Object URL para un blob, con su ciclo de vida en UN solo lugar: se crea al
 * cambiar el blob y se revoca al reemplazarlo o al desmontar.
 *
 * Antes cada pantalla llamaba a revokeObjectURL a mano en cada camino que podía
 * cambiar la imagen (elegir otra, reiniciar, desmontar); olvidarse de uno filtra
 * el blob, y como el navegador no avisa, la fuga es invisible hasta que la
 * pestaña se hincha. Pasando el blob y leyendo la URL, no hay camino que olvidar.
 */
export function useObjectUrl(source: Blob | null | undefined): string | null {
  const url = useMemo(() => (source ? URL.createObjectURL(source) : null), [source])

  useEffect(() => {
    if (!url) return
    return () => URL.revokeObjectURL(url)
  }, [url])

  return url
}

export default useObjectUrl
