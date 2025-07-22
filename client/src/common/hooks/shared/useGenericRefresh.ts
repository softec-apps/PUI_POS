'use client'

import { toast } from 'sonner'
import { useState, useCallback } from 'react'

export function useGenericRefresh(refetchFunction: () => Promise<void>) {
	const [isRefreshing, setIsRefreshing] = useState(false)

	const handleRefresh = useCallback(async () => {
		try {
			setIsRefreshing(true)
			await refetchFunction()
			toast.info('Registros actualizados exitosamente')
		} catch (error) {
			console.error('Error al refrescar registros:', error)
			toast.error('Error al refrescar registros')
		} finally {
			setIsRefreshing(false)
		}
	}, [refetchFunction])

	return {
		isRefreshing,
		handleRefresh,
	}
}
