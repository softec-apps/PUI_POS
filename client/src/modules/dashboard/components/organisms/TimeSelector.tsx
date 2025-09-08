'use client'
import React, { useState, useEffect } from 'react'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { formatDate } from '@/common/utils/dateFormater-util'
import { formatTime } from '@/modules/dashboard/utils/timeUtils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TimeSelectorProps {
	currentTime: Date
	dateRange: string
	onDateRangeChange: (value: string) => void
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ currentTime, dateRange, onDateRangeChange }) => {
	const [location, setLocation] = useState<string>('')

	useEffect(() => {
		// Función para obtener ubicación usando IP como fallback
		const getLocationByIP = async () => {
			try {
				// Usamos ipapi.co que es gratuito y confiable
				const response = await fetch('https://ipapi.co/json/')
				const data = await response.json()

				if (data) {
					setLocation(`${data.country_name},`)
				} else {
					setLocation('Ubicación por IP no disponible')
				}
			} catch (error) {
				console.error('Error obteniendo ubicación por IP:', error)
				setLocation('Ubicación no disponible')
			}
		}

		// Función para obtener la ubicación del usuario
		const getLocation = async () => {
			// Verificar si la geolocalización está disponible
			if (!navigator.geolocation) {
				console.log('Geolocalización no soportada, usando IP')
				await getLocationByIP()
				return
			}

			// Verificar si estamos en HTTPS (requerido para geolocalización)
			if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
				console.log('HTTPS requerido para geolocalización, usando IP')
				await getLocationByIP()
				return
			}

			// Configurar opciones para una mejor precisión
			const options = {
				enableHighAccuracy: false, // Cambiado a false para mayor compatibilidad
				timeout: 15000, // 15 segundos timeout
				maximumAge: 300000, // Cache por 5 minutos
			}

			console.log('Intentando obtener geolocalización...')

			navigator.geolocation.getCurrentPosition(
				async position => {
					try {
						const { latitude, longitude } = position.coords
						console.log(`Coordenadas obtenidas: ${latitude}, ${longitude}`)

						// Usamos la API de geocodificación inversa de OpenStreetMap
						const response = await fetch(
							`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es&addressdetails=1`,
							{
								headers: {
									'User-Agent': 'TimeSelector/1.0 (https://example.com)',
								},
							}
						)

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`)
						}

						const data = await response.json()
						console.log('Respuesta de geocodificación:', data)

						if (data && data.address) {
							// Intentamos obtener la ciudad o pueblo primero, luego el estado/región
							const city =
								data.address.city ||
								data.address.town ||
								data.address.village ||
								data.address.municipality ||
								data.address.county ||
								data.address.suburb
							const state = data.address.state || data.address.region || data.address.province
							const country = data.address.country

							if (city && country) {
								setLocation(`${city}, ${country}`)
							} else if (state && country) {
								setLocation(`${state}, ${country}`)
							} else if (country) {
								setLocation(country)
							} else {
								setLocation('Ubicación encontrada')
							}
						} else {
							console.log('No se pudo obtener dirección, usando IP como fallback')
							await getLocationByIP()
						}
					} catch (error) {
						console.error('Error obteniendo la ubicación:', error)
						console.log('Error en geocodificación, usando IP como fallback')
						await getLocationByIP()
					}
				},
				async error => {
					console.error('Error de geolocalización:', error)

					switch (error.code) {
						case error.PERMISSION_DENIED:
							console.log('Permisos denegados, usando IP como fallback')
							break
						case error.POSITION_UNAVAILABLE:
							console.log('Posición no disponible, usando IP como fallback')
							break
						case error.TIMEOUT:
							console.log('Timeout de geolocalización, usando IP como fallback')
							break
						default:
							console.log('Error desconocido, usando IP como fallback')
							break
					}

					// En cualquier error, usar IP como fallback
					await getLocationByIP()
				},
				options
			)
		}

		getLocation()
	}, [])

	return (
		<div className='text-muted-foreground flex items-center justify-between gap-4 text-sm md:flex-col md:items-end'>
			<Typography variant='small' className='text-xs font-normal'>
				{location} {formatDate(currentTime)} • {formatTime(currentTime)}
			</Typography>

			<div className='flex items-center gap-2'>
				<Icons.sparkles className='h-4 w-4' />
				<Select value={dateRange} onValueChange={onDateRangeChange}>
					<SelectTrigger className='w-auto border-none shadow-none'>
						<SelectValue placeholder='Seleccionar período' />
					</SelectTrigger>
					<SelectContent align='end' className='text-muted-foreground'>
						<SelectItem value='7'>Últimos 7 días</SelectItem>
						<SelectItem value='15'>Últimos 15 días</SelectItem>
						<SelectItem value='30'>Últimos 30 días</SelectItem>
						<SelectItem value='1'>Último mes</SelectItem>
						<SelectItem value='3'>Últimos 3 meses</SelectItem>
						<SelectItem value='6'>Últimos 6 meses</SelectItem>
						<SelectItem value='12'>Último año</SelectItem>
						<SelectItem value='0'>Todo el tiempo</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	)
}
