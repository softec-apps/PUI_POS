import api from '@/lib/axios'
import { useState, useEffect, useCallback } from 'react'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

// Types
interface BillingConfig {
	id: string
	email: string
	password: string
	createdAt: string
	updatedAt: string
}

interface ConnectionStatus {
	authenticated: boolean
	puntosEmisionCount: number
	timestamp: string
}

interface SignatureInfo {
	expires_at?: string
	subject?: string
	issuer?: string
	valid?: boolean
}

interface CreateBillingDto {
	email: string
	password: string
}

interface UpdateBillingDto {
	email?: string
	password?: string
}

interface ApiResponse<T> {
	success: boolean
	message: string
	data: T
}

export function useBilling() {
	// Estados principales
	const [recordsData, setRecordsData] = useState<{ data: BillingConfig[] } | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Estados de operaciones
	const [isUpdating, setIsUpdating] = useState(false)
	const [isTesting, setIsTesting] = useState(false)
	const [isReloading, setIsReloading] = useState(false)
	const [isUploadingSignature, setIsUploadingSignature] = useState(false)

	// Estados de información
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
	const [signatureInfo, setSignatureInfo] = useState<SignatureInfo | null>(null)

	// Cargar configuraciones de billing
	const loadBillingConfigs = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)

			const response = await api.get(`${ENDPOINT_API.BILLING}/config`)
			setRecordsData({ data: response.data.data })
		} catch (err: any) {
			console.error('Error loading billing configs:', err)
			setError(err.response?.data?.message || err.message || 'Error al cargar configuraciones')
		} finally {
			setLoading(false)
		}
	}, [])

	// Crear nueva configuración
	const createRecord = useCallback(
		async (data: CreateBillingDto): Promise<BillingConfig> => {
			try {
				setIsUpdating(true)
				const response = await api.post(`${ENDPOINT_API.BILLING}/config`, data)

				// Recargar la lista
				await loadBillingConfigs()
				return response.data.data
			} catch (err: any) {
				const errorMessage = err.response?.data?.message || err.message || 'Error al crear configuración'
				throw new Error(errorMessage)
			} finally {
				setIsUpdating(false)
			}
		},
		[loadBillingConfigs]
	)

	// Actualizar configuración existente
	const updateRecord = useCallback(
		async (id: string, data: UpdateBillingDto): Promise<BillingConfig> => {
			try {
				setIsUpdating(true)
				const response = await api.put(`${ENDPOINT_API.BILLING}/config/${id}`, data)

				// Recargar la lista
				await loadBillingConfigs()
				return response.data.data
			} catch (err: any) {
				const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar configuración'
				throw new Error(errorMessage)
			} finally {
				setIsUpdating(false)
			}
		},
		[loadBillingConfigs]
	)

	// Eliminar configuración
	const deleteRecord = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				setIsUpdating(true)
				await api.delete<ApiResponse<void>>(`${ENDPOINT_API.BILLING}/config/${id}`)

				// Recargar la lista
				await loadBillingConfigs()
				return true
			} catch (err: any) {
				const errorMessage = err.response?.data?.message || err.message || 'Error al eliminar configuración'
				throw new Error(errorMessage)
			} finally {
				setIsUpdating(false)
			}
		},
		[loadBillingConfigs]
	)

	// Probar conexión con la API
	const testConnection = useCallback(async (): Promise<ConnectionStatus> => {
		try {
			setIsTesting(true)
			const response = await api.get(`${ENDPOINT_API.BILLING}/test-connection`)
			setConnectionStatus(response.data.data)
			return response.data.data
		} catch (err: any) {
			setConnectionStatus(null)
			const errorMessage = err.response?.data?.message || err.message || 'Error al probar conexión'
			throw new Error(errorMessage)
		} finally {
			setIsTesting(false)
		}
	}, [])

	// Recargar credenciales
	const reloadCredentials = useCallback(async (): Promise<void> => {
		try {
			setIsReloading(true)
			await api.post(`${ENDPOINT_API.BILLING}/auth/reload-credentials`)

			// Recargar configuraciones después de recargar credenciales
			await loadBillingConfigs()
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || err.message || 'Error al recargar credenciales'
			throw new Error(errorMessage)
		} finally {
			setIsReloading(false)
		}
	}, [loadBillingConfigs])

	// Subir firma digital
	const uploadSignature = useCallback(async (file: File, signatureKey: string): Promise<any> => {
		try {
			setIsUploadingSignature(true)

			const formData = new FormData()
			formData.append('signature_file', file)
			formData.append('signature_key', signatureKey)

			const response = await api.post(`${ENDPOINT_API.BILLING}/signature/upload`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})

			return response.data.data
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || err.message || 'Error al subir firma digital'
			throw new Error(errorMessage)
		} finally {
			setIsUploadingSignature(false)
		}
	}, [])

	// Obtener información de firma
	const getSignatureInfo = useCallback(async (): Promise<SignatureInfo | null> => {
		try {
			const response = await api.get(`${ENDPOINT_API.BILLING}/signature/info`)
			setSignatureInfo(response.data.data)
			return response.data.data
		} catch (err: any) {
			// Si es 404, significa que no hay firma configurada
			if (err.response?.status === 404) {
				setSignatureInfo(null)
				return null
			}
			console.error('Error getting signature info:', err)
			const errorMessage = err.response?.data?.message || err.message || 'Error al obtener información de firma'
			throw new Error(errorMessage)
		}
	}, [])

	// Obtener puntos de emisión
	const getPuntosEmision = useCallback(async (): Promise<any[]> => {
		try {
			const response = await api.get<ApiResponse<any[]>>(`${ENDPOINT_API.BILLING}/puntos-emision`)
			return response.data.data
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || err.message || 'Error al obtener puntos de emisión'
			throw new Error(errorMessage)
		}
	}, [])

	// Crear factura simple
	const createSimpleFactura = useCallback(
		async (
			puntoEmision: string,
			facturaData: {
				cliente: {
					tipoIdentificacion: string
					razonSocial: string
					identificacion: string
					direccion: string
					email: string
					telefono: string
				}
				productos: {
					codigo: string
					descripcion: string
					cantidad: number
					precioUnitario: number
					ivaPorcentaje: number
				}[]
				formaPago?: string
			}
		): Promise<any> => {
			try {
				const response = await api.post(`${ENDPOINT_API.BILLING}/factura-simple/${puntoEmision}`, facturaData)
				return response.data.data
			} catch (err: any) {
				const errorMessage = err.response?.data?.message || err.message || 'Error al crear factura'
				throw new Error(errorMessage)
			}
		},
		[]
	)

	// Crear factura completa
	const createFactura = useCallback(async (puntoEmision: string, facturaData: any): Promise<any> => {
		try {
			const response = await api.post(`${ENDPOINT_API.BILLING}/factura/${puntoEmision}`, facturaData)
			return response.data.data
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || err.message || 'Error al crear factura'
			throw new Error(errorMessage)
		}
	}, [])

	// Obtener estado de credenciales
	const getCredentialsStatus = useCallback(async (): Promise<{ hasCredentials: boolean; email?: string }> => {
		try {
			const response = await api.get<ApiResponse<{ hasCredentials: boolean; email?: string }>>(
				`${ENDPOINT_API.BILLING}/auth/status`
			)
			return response.data.data
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || err.message || 'Error al obtener estado de credenciales'
			throw new Error(errorMessage)
		}
	}, [])

	// Autenticar con API externa
	const authenticate = useCallback(async (): Promise<any> => {
		try {
			const response = await api.post(`${ENDPOINT_API.BILLING}/auth/login`)
			return response.data.data
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || err.message || 'Error de autenticación'
			throw new Error(errorMessage)
		}
	}, [])

	// Cargar datos al montar el hook
	useEffect(() => {
		loadBillingConfigs()
	}, [loadBillingConfigs])

	// Cargar estado inicial de conexión y firma
	useEffect(() => {
		const loadInitialData = async () => {
			try {
				// Cargar información de firma si existe
				await getSignatureInfo()

				// Verificar estado de conexión si hay configuraciones
				if (recordsData?.data?.length > 0) {
					await testConnection().catch(() => {
						// Silenciar error si no hay conexión inicial
					})
				}
			} catch (error) {
				// Silenciar errores de carga inicial
				console.warn('Error loading initial billing data:', error)
			}
		}

		if (!loading && recordsData) {
			loadInitialData()
		}
	}, [loading, recordsData])

	// Obtener perfil del usuario
	const getProfile = useCallback(async (): Promise<any> => {
		try {
			const response = await api.get(`${ENDPOINT_API}/profile`)
			return response.data.data
		} catch (err: any) {
			const errorMessage = err.response?.data?.message || err.message || 'Error al obtener perfil'
			throw new Error(errorMessage)
		}
	}, [])

	return {
		// Datos principales
		recordsData,
		loading,
		error,

		// Operaciones CRUD
		createRecord,
		updateRecord,
		deleteRecord,
		isUpdating,

		// Conexión y diagnóstico
		testConnection,
		isTesting,
		connectionStatus,
		reloadCredentials,
		isReloading,
		getCredentialsStatus,
		authenticate,

		// Firma digital
		uploadSignature,
		isUploadingSignature,
		signatureInfo,
		getSignatureInfo,

		// Facturación
		getPuntosEmision,
		createSimpleFactura,
		createFactura,

		// Perfil
		getProfile,

		// Utilidades
		refetch: loadBillingConfigs,
	}
}
