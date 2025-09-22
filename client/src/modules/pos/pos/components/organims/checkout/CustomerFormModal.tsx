'use client'

import { z } from 'zod'
import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icons } from '@/components/icons'
import { useForm, FormProvider } from 'react-hook-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { FormFooter } from '@/modules/customer/components/organisms/Form/FooterSection'
import {
	validateCedula,
	validateEcuadorianRUC,
	validateEntidadPublica,
	validatePersonaJuridica,
} from '@/common/utils/ecValidation-util'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { usePerson } from '@/modules/pos/pos/hooks/usePerson'

const customerSchema = z
	.object({
		customerType: z.enum(['regular', 'final_consumer']),
		identificationType: z.enum(['04', '05', '06', '07']),
		identificationNumber: z.string().min(1, 'Número de identificación es requerido'),
		firstName: z.string().min(1, 'Nombre es requerido'),
		lastName: z.string().optional(),
		email: z.string().email('Email no válido').optional().or(z.literal('')),
	})
	.refine(
		data => {
			const { identificationType, identificationNumber } = data

			switch (identificationType) {
				case '04': // RUC
					return (
						validateEcuadorianRUC(identificationNumber) ||
						validateEntidadPublica(identificationNumber) ||
						validatePersonaJuridica(identificationNumber)
					)
				case '05': // Cédula
					return validateCedula(identificationNumber)
				case '06': // Pasaporte
					return identificationNumber.length > 0
				default:
					return false
			}
		},
		{
			message: 'Número de identificación inválido',
			path: ['identificationNumber'],
		}
	)

type CustomerFormData = z.infer<typeof customerSchema>

interface Props {
	isOpen: boolean
	defaultValues?: Partial<CustomerFormData>
	currentCustomer?: any // Para compatibilidad con FormFooter
	onClose: () => void
	onSubmit: (data: CustomerFormData) => Promise<void>
}

export function CustomerFormModal({ isOpen, defaultValues, currentCustomer, onClose, onSubmit }: Props) {
	// Estado para controlar si se deben mostrar los campos adicionales
	const [showAdditionalFields, setShowAdditionalFields] = useState(false)
	const [hasSearched, setHasSearched] = useState(false)

	const methods = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema),
		mode: 'onChange',
		defaultValues: {
			customerType: 'regular',
			identificationType: '05',
			identificationNumber: '',
			firstName: '',
			lastName: '',
			email: '',
			...defaultValues,
		},
	})

	const {
		handleSubmit,
		reset,
		control,
		formState,
		formState: { errors, isValid, isDirty },
		watch,
		setValue,
		trigger, // Agregamos trigger para forzar validación
	} = methods

	// Watch para obtener los valores actuales
	const identificationNumber = watch('identificationNumber')
	const identificationType = watch('identificationType')

	// Hook para búsqueda de personas con debounce
	const { personData, isLoading, error, clearData } = usePerson(
		identificationNumber,
		identificationType,
		500 // 500ms de debounce
	)

	useEffect(() => {
		if (isOpen) {
			// Resetear estados
			setShowAdditionalFields(false)
			setHasSearched(false)

			reset({
				customerType: 'regular',
				identificationType: '05',
				identificationNumber: '',
				firstName: '',
				lastName: '',
				email: '',
				...defaultValues,
			})

			// Si hay defaultValues o currentCustomer, mostrar campos adicionales
			if (defaultValues || currentCustomer) {
				setShowAdditionalFields(true)
				setHasSearched(true)
			}
		}
	}, [isOpen, defaultValues, reset, currentCustomer])

	// Efecto para limpiar datos cuando cambia el tipo de identificación
	const prevIdentificationType = React.useRef(identificationType)
	useEffect(() => {
		if (prevIdentificationType.current !== identificationType) {
			setValue('identificationNumber', '')
			clearData()
			// Limpiar también los campos que podrían haberse auto-completado
			setValue('firstName', '')
			setValue('lastName', '')
			setValue('email', '')
			// Ocultar campos adicionales al cambiar tipo
			setShowAdditionalFields(false)
			setHasSearched(false)
		}
		prevIdentificationType.current = identificationType
	}, [identificationType, setValue, clearData])

	// Efecto para manejar la respuesta de la búsqueda
	useEffect(() => {
		// Solo procesar si hay un número de identificación válido
		if (!identificationNumber || identificationNumber.length < 3) {
			setShowAdditionalFields(false)
			setHasSearched(false)
			return
		}

		// Si terminó la búsqueda completamente (sin importar el resultado)
		if (!isLoading && hasSearched) {
			setShowAdditionalFields(true)

			// Auto-completar datos si se encontraron
			if (personData) {
				// Para personas naturales (CI)
				if (personData.type_identification === 'CC' || identificationType === '05') {
					setValue('firstName', personData.name || '', { shouldDirty: true, shouldValidate: true })
					setValue('lastName', personData.surname || '', { shouldDirty: true, shouldValidate: true })
					setValue('email', personData.email || '', { shouldDirty: true, shouldValidate: true })
				}
				// Para personas jurídicas (RUC)
				else if (personData.type_identification === 'RUC' || identificationType === '04') {
					setValue('firstName', personData.name || '', { shouldDirty: true, shouldValidate: true })
					setValue('lastName', '', { shouldDirty: true, shouldValidate: true }) // Las personas jurídicas no tienen apellido
					setValue('email', personData.email || '', { shouldDirty: true, shouldValidate: true })
				}

				// Forzar una nueva validación después de establecer los valores
				setTimeout(() => {
					trigger()
				}, 100)
			}
		}
		// Marcar que se está haciendo una búsqueda
		else if (isLoading) {
			setHasSearched(true)
			setShowAdditionalFields(false) // Mantener ocultos durante la búsqueda
		}
	}, [personData, error, isLoading, setValue, identificationType, identificationNumber, hasSearched, trigger])

	const handleFormSubmit = async (data: CustomerFormData) => {
		try {
			await onSubmit(data)
			// Solo resetear si la operación fue exitosa
			reset()
			clearData()
			setShowAdditionalFields(false)
			setHasSearched(false)
		} catch (error) {
			console.error('Error al enviar formulario:', error)
			// NO resetear el formulario en caso de error
			// Los datos del usuario se mantienen para que pueda corregir
		}
	}

	const handleClose = () => {
		reset()
		clearData()
		setShowAdditionalFields(false)
		setHasSearched(false)
		onClose()
	}

	if (!isOpen) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='z-50 flex max-h-screen min-w-2xl flex-col p-0 [&>button]:hidden'>
				<DialogHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 rounded-t-2xl border-b p-4 supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<DialogTitle>{currentCustomer?.id ? 'Editar Cliente' : 'Crear Cliente'}</DialogTitle>

						<DialogClose>
							<ActionButton
								type='button'
								variant='ghost'
								size='icon'
								disabled={formState.isSubmitting}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</DialogClose>
					</div>

					<DialogDescription>
						{!showAdditionalFields
							? 'Ingresa el tipo y número de identificación para continuar'
							: 'Completa los datos del cliente'}
					</DialogDescription>
				</DialogHeader>

				<div className='flex-1 space-y-4 overflow-auto p-4'>
					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
							<div className='space-y-8'>
								{/* Información de identificación - Siempre visible */}
								<div className='space-y-4'>
									<div className='grid grid-cols-2 gap-4'>
										<UniversalFormField
											control={control}
											name='identificationType'
											label='Tipo de identificación'
											type='select'
											options={[
												{ label: 'RUC', value: '04' },
												{ label: 'Cédula', value: '05' },
												{ label: 'Pasaporte', value: '06' },
											]}
											required
											showValidationIcons
										/>

										<div className='relative'>
											<UniversalFormField
												control={control}
												name='identificationNumber'
												label='Número de identificación'
												placeholder='Ej: 1234567890'
												type='text'
												required
												showValidationIcons
											/>
											{isLoading && (
												<div className='bg-popover text-primary absolute top-1/2 right-3 z-50 -translate-y-1/2 transform'>
													<Icons.spinnerSimple className='text-primary h-4 w-4 animate-spin' />
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Información personal */}
								<div className='grid grid-cols-2 gap-4'>
									<UniversalFormField
										control={control}
										name='firstName'
										label='Nombres'
										placeholder='Ingresa el nombre'
										type='text'
										required
										showValidationIcons
									/>

									<UniversalFormField
										control={control}
										name='lastName'
										label='Apellidos'
										placeholder='Ingresa el apellido'
										type='text'
										showValidationIcons
										required={identificationType !== '04'} // No requerido para RUC
									/>
								</div>

								<UniversalFormField
									control={control}
									name='email'
									label='Email'
									placeholder='email@ejemplo.com'
									type='email'
									showValidationIcons
									required
								/>
							</div>
						</form>
					</FormProvider>
				</div>

				{/* Footer solo visible cuando termine la búsqueda y se muestren los campos adicionales */}
				{!isLoading && showAdditionalFields && (
					<FormFooter
						formState={formState}
						isFormValid={isValid}
						currentRecord={currentCustomer}
						onClose={handleClose}
						onSubmit={handleSubmit(handleFormSubmit)}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
