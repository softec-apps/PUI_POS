import { useState, useEffect, useCallback } from 'react'

interface PersonData {
	id: number
	name: string
	email?: string | null
	phone?: string | null
	address?: string | null
	city?: string | null
	country?: string | null
	observation?: string | null
	identification: string
	type_identification: string
	// Campos específicos para personas naturales (CI)
	surname?: string
	full_name?: string
	mobile?: string | null
	date_of_birth?: string
	place_of_birth?: string
	gender?: string | null
	nationality?: string | null
	profession?: string
	citizen_status?: string
	civil_status?: string
	// Campos específicos para personas jurídicas (RUC)
	regimen?: string
	regimen_status?: string
	representative_name?: string | null
	representative_identification?: string | null
	representative_phone?: string | null
	state?: string
	class_contributor?: string | null
	start_date?: string | null
	end_date?: string | null
	update_date?: string | null
	economic_activity?: string | null
	retention_agent?: number
	special?: number
	contributor_type?: string | null
	establecimientos?: any[]
}

interface ApiResponse {
	success: boolean
	code: number
	status: string
	data: PersonData
}

interface UsePersonLookupReturn {
	personData: PersonData | null
	isLoading: boolean
	error: string | null
	clearData: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_PERSON
const BEARER_TOKEN = process.env.API_BEARER_TOKEN_PERSON

export const usePerson = (
	identificationNumber: string,
	identificationType: string,
	debounceMs: number = 500
): UsePersonLookupReturn => {
	const [personData, setPersonData] = useState<PersonData | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchPersonData = useCallback(async (identification: string, type: string) => {
		if (!identification || identification.length < 8) {
			setPersonData(null)
			setError(null)
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			let endpoint = ''

			// Determinar el endpoint según el tipo de identificación
			switch (type) {
				case '04': // RUC
					endpoint = `${API_BASE_URL}/ruc/${identification}`
					break
				case '05': // Cédula
					endpoint = `${API_BASE_URL}/ci/${identification}`
					break
				case '06': // Pasaporte - no tiene endpoint específico, usar CI como fallback
				case '07': // Otros
					endpoint = `${API_BASE_URL}/ci/${identification}`
					break
				default:
					throw new Error('Tipo de identificación no válido')
			}

			const response = await fetch(endpoint, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${BEARER_TOKEN}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			})

			if (!response.ok) {
				if (response.status === 404) {
					setPersonData(null)
					setError('No se encontraron datos para esta identificación')
					return
				}
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const result: ApiResponse = await response.json()

			if (result.success && result.data) {
				setPersonData(result.data)
				setError(null)
			} else {
				setPersonData(null)
				setError('No se encontraron datos para esta identificación')
			}
		} catch (err) {
			console.error('Error fetching person data:', err)
			setPersonData(null)
			setError(err instanceof Error ? err.message : 'Error al buscar datos')
		} finally {
			setIsLoading(false)
		}
	}, [])

	// Debounce effect
	useEffect(() => {
		if (!identificationNumber) {
			setPersonData(null)
			setError(null)
			return
		}

		const timer = setTimeout(() => {
			fetchPersonData(identificationNumber, identificationType)
		}, debounceMs)

		return () => clearTimeout(timer)
	}, [identificationNumber, identificationType, debounceMs, fetchPersonData])

	const clearData = useCallback(() => {
		setPersonData(null)
		setError(null)
	}, [])

	return {
		personData,
		isLoading,
		error,
		clearData,
	}
}
