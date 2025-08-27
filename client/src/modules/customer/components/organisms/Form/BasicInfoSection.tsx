'use client'

import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { Control, useWatch } from 'react-hook-form'
import { CustomerFormData } from '@/modules/customer/types/customer-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerType, IdentificationType, IdentificationTypeLabels_ES } from '@/common/enums/customer.enum'
import { Icons } from '@/components/icons'
import { AlertMessage } from '@/components/layout/atoms/Alert'

interface BasicInfoSectionProps {
	control: Control<CustomerFormData>
	originalData?: CustomerFormData | null // Datos originales del cliente siendo editado
}

const IDENTIFICATION_TYPE_OPTIONS = [
	{
		key: IdentificationType.RUC,
		label: IdentificationTypeLabels_ES[IdentificationType.RUC],
		description: 'Para empresas y negocios',
		color: 'bg-blue-500',
	},
	{
		key: IdentificationType.IDENTIFICATION_CARD,
		label: IdentificationTypeLabels_ES[IdentificationType.IDENTIFICATION_CARD],
		description: 'Para personas naturales',
		color: 'bg-green-500',
	},
	{
		key: IdentificationType.PASSPORT,
		label: IdentificationTypeLabels_ES[IdentificationType.PASSPORT],
		description: 'Para extranjeros',
		color: 'bg-purple-500',
	},
	{
		key: IdentificationType.FINAL_CONSUMER,
		label: IdentificationTypeLabels_ES[IdentificationType.FINAL_CONSUMER],
		description: 'Cliente sin identificación específica',
		color: 'bg-orange-500',
	},
]

export function BasicInfoSection({ control, originalData }: BasicInfoSectionProps) {
	const { setValue, watch, trigger, clearErrors } = useFormContext<CustomerFormData>()

	// Referencias para evitar bucles infinitos
	const isSettingFinalConsumer = useRef(false)
	const previousCustomerType = useRef<CustomerType | null>(null)

	// Observar cambios en customerType e identificationType
	const customerType = useWatch({ control, name: 'customerType' })
	const identificationType = useWatch({ control, name: 'identificationType' })
	const identificationNumber = useWatch({ control, name: 'identificationNumber' })

	// Efecto para manejar el cambio a consumidor final
	useEffect(() => {
		if (isSettingFinalConsumer.current) return

		if (customerType === CustomerType.FINAL_CONSUMER && previousCustomerType.current !== CustomerType.FINAL_CONSUMER) {
			isSettingFinalConsumer.current = true

			setValue('firstName', 'CONSUMIDOR')
			setValue('lastName', 'FINAL')
			setValue('identificationNumber', '9999999999999')
			setValue('identificationType', IdentificationType.FINAL_CONSUMER)
			setValue('phone', '')
			setValue('address', '')
			setValue('email', '')

			// Limpiar errores de validación específicos
			clearErrors(['email', 'firstName', 'lastName', 'phone', 'address', 'identificationNumber'])

			// Forzar revalidación después de un momento
			setTimeout(() => trigger(), 100)

			setTimeout(() => (isSettingFinalConsumer.current = false), 100)
		}

		// Si cambia de consumidor final a regular, restaurar datos originales o limpiar
		if (customerType === CustomerType.REGULAR && previousCustomerType.current === CustomerType.FINAL_CONSUMER) {
			if (originalData) {
				// Restaurar datos originales si estamos editando
				setValue('firstName', originalData.firstName || '')
				setValue('lastName', originalData.lastName || '')
				setValue('identificationNumber', originalData.identificationNumber || '')
				setValue('identificationType', originalData.identificationType || IdentificationType.IDENTIFICATION_CARD)
				setValue('phone', originalData.phone || '')
				setValue('address', originalData.address || '')
				setValue('email', originalData.email || '')
			} else {
				// Limpiar campos si es un cliente nuevo
				setValue('firstName', '')
				setValue('lastName', '')
				setValue('identificationNumber', '')
				setValue('identificationType', IdentificationType.IDENTIFICATION_CARD)
				setValue('phone', '')
				setValue('address', '')
				setValue('email', '')
			}

			// Limpiar errores de validación
			clearErrors()
		}

		previousCustomerType.current = customerType
	}, [customerType, setValue, clearErrors, originalData])

	// Efecto para validar en tiempo real cuando cambia el tipo de identificación o el número
	useEffect(() => {
		if (identificationNumber && identificationType && !isSettingFinalConsumer.current) {
			// Solo validar el campo de número de identificación cuando hay un valor
			// Esto mostrará la validación adecuada según el nuevo tipo seleccionado
			setTimeout(() => trigger('identificationNumber'), 100)
		}
	}, [identificationType, identificationNumber, trigger])

	const isFinalConsumer = customerType === CustomerType.FINAL_CONSUMER

	const handleCustomerTypeChange = (type: CustomerType) => setValue('customerType', type)

	const handleIdentificationTypeSelect = (type: IdentificationType) => {
		// No permitir seleccionar consumidor final si el tipo de cliente es regular
		if (type === IdentificationType.FINAL_CONSUMER && customerType === CustomerType.REGULAR) return

		setValue('identificationType', type)

		// Si selecciona consumidor final, cambiar también el customerType
		if (type === IdentificationType.FINAL_CONSUMER) setValue('customerType', CustomerType.FINAL_CONSUMER)

		// Solo limpiar el número si no hay un valor previo o si es consumidor final
		// Para otros tipos, mantener el valor y dejar que la validación en tiempo real funcione
		if (type === IdentificationType.FINAL_CONSUMER && !isSettingFinalConsumer.current) {
			// Para consumidor final sí limpiamos porque tiene un valor específico
			setValue('identificationNumber', '9999999999999')
		}

		// Disparar validación inmediata del número existente con el nuevo tipo
		setTimeout(() => trigger('identificationNumber'), 50)
	}

	const getFieldLabel = () => {
		switch (identificationType) {
			case IdentificationType.RUC:
				return 'RUC'
			case IdentificationType.IDENTIFICATION_CARD:
				return 'Cédula de Identidad'
			case IdentificationType.PASSPORT:
				return 'Pasaporte'
			case IdentificationType.FINAL_CONSUMER:
				return 'Identificación'
			default:
				return 'Número de identificación'
		}
	}

	const getFieldPlaceholder = () => {
		switch (identificationType) {
			case IdentificationType.RUC:
				return 'Ej. 1790012345001'
			case IdentificationType.IDENTIFICATION_CARD:
				return 'Ej. 1234567890'
			case IdentificationType.PASSPORT:
				return 'Ej. AB123456'
			case IdentificationType.FINAL_CONSUMER:
				return '9999999999999'
			default:
				return 'Ingrese el número'
		}
	}

	// Determinar si una opción de identificación debe estar deshabilitada
	const isIdentificationOptionDisabled = (optionKey: IdentificationType) => {
		// Si es consumidor final, solo permitir la opción de consumidor final
		if (isFinalConsumer && optionKey !== IdentificationType.FINAL_CONSUMER) return true

		// Si es cliente regular, deshabilitar la opción de consumidor final
		if (customerType === CustomerType.REGULAR && optionKey === IdentificationType.FINAL_CONSUMER) return true

		return false
	}

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardContent className='grid grid-cols-5 gap-16 space-y-6 p-0'>
				<div className='col-span-3 space-y-10'>
					{/* Tipo de Cliente */}
					<div className='space-y-4'>
						<CardHeader className='p-0'>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<Icons.userCog className='h-4 w-4' />
								Tipo de Cliente
							</CardTitle>
						</CardHeader>

						<div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
							<Card
								className={`cursor-pointer p-0 transition-all duration-500 ${customerType === CustomerType.REGULAR ? 'ring-primary ring-2' : ''}`}
								onClick={() => handleCustomerTypeChange(CustomerType.REGULAR)}>
								<CardContent className='p-4'>
									<div className='flex items-center justify-between'>
										<div>
											<h4 className='font-medium'>Cliente Regular</h4>
											<p className='text-muted-foreground text-sm'>Con datos completos</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card
								className={`cursor-pointer p-0 transition-all duration-500 ${customerType === CustomerType.FINAL_CONSUMER ? 'ring-primary ring-2' : ''}`}
								onClick={() => handleCustomerTypeChange(CustomerType.FINAL_CONSUMER)}>
								<CardContent className='p-4'>
									<div className='flex items-center justify-between'>
										<div>
											<h4 className='font-medium'>Consumidor Final</h4>
											<p className='text-muted-foreground text-sm'>Sin datos específicos</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Tipo de Identificación */}
					<div className='space-y-3'>
						<CardHeader className='p-0'>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<Icons.userCog className='h-4 w-4' />
								Tipo de Identificación
							</CardTitle>
						</CardHeader>

						<div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4'>
							{IDENTIFICATION_TYPE_OPTIONS.map(option => {
								const isDisabled = isIdentificationOptionDisabled(option.key)

								return (
									<Card
										key={option.key}
										className={`p-0 transition-all duration-500 ${
											identificationType === option.key ? 'ring-primary ring-2' : ''
										} ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'}`}
										onClick={() => {
											if (!isDisabled) {
												handleIdentificationTypeSelect(option.key)
											}
										}}>
										<CardContent className='p-4'>
											<div className='flex flex-col space-y-2'>
												<div className='flex items-center justify-between'>
													<div className={`h-3 w-3 rounded-full ${option.color} ${isDisabled ? 'opacity-50' : ''}`} />
												</div>
												<div>
													<h4 className={`text-sm font-medium ${isDisabled ? 'text-muted-foreground' : ''}`}>
														{option.label}
													</h4>
													<p className='text-muted-foreground text-xs'>{option.description}</p>
												</div>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>
					</div>

					{isFinalConsumer && (
						<AlertMessage
							variant='warning'
							title='Consumidor Final'
							message='Los campos se han completado automáticamente para un consumidor final. Solo el email es opcional para este tipo de cliente'
						/>
					)}
				</div>

				<div className='col-span-2 grid gap-4'>
					<CardHeader className='p-0'>
						<CardTitle className='flex items-center gap-2 text-lg'>
							<Icons.userCog className='h-4 w-4' />
							Datos personales
						</CardTitle>
					</CardHeader>

					<div className='grid grid-cols-2 gap-8'>
						<UniversalFormField
							required={!isFinalConsumer}
							control={control}
							name='firstName'
							label={identificationType === IdentificationType.RUC ? 'Razón social' : 'Nombres'}
							placeholder={
								identificationType === IdentificationType.RUC ? 'Ej. COMERCIALIZADORA ANDINA S.A.' : 'Ej. Juan Carlos'
							}
							type='text'
							showValidationIcons={true}
							disabled={isFinalConsumer}
						/>

						<UniversalFormField
							required={!isFinalConsumer}
							control={control}
							name='lastName'
							label={identificationType === IdentificationType.RUC ? 'Nombre comercial' : 'Apellidos'}
							placeholder={identificationType === IdentificationType.RUC ? 'Ej. DISTRIANDINA' : 'Ej. Pérez González'}
							type='text'
							disabled={isFinalConsumer}
						/>
					</div>

					<UniversalFormField
						required={!isFinalConsumer}
						control={control}
						name='email'
						label='Email'
						placeholder='Ej. contacto@ejemplo.com'
						type='email'
					/>

					<div className='grid grid-cols-2 gap-8'>
						<UniversalFormField
							required
							control={control}
							name='identificationNumber'
							label={getFieldLabel()}
							placeholder={getFieldPlaceholder()}
							type='text'
							showValidationIcons={true}
							disabled={isFinalConsumer}
						/>

						<UniversalFormField
							control={control}
							name='phone'
							label='Teléfono'
							placeholder='Ej. 0987654321'
							type='text'
							disabled={isFinalConsumer}
						/>
					</div>

					<UniversalFormField
						control={control}
						name='address'
						label='Dirección'
						placeholder='Ej. Av. Amazonas N24-03 y Colón'
						type='text'
						disabled={isFinalConsumer}
					/>
				</div>
			</CardContent>
		</Card>
	)
}
