'use client'

import { z } from 'zod'
import React, { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFooter } from '@/modules/customer/components/organisms/Modal/FormFooter'
import {
	validateCedula,
	validateEcuadorianRUC,
	validateEntidadPublica,
	validatePersonaJuridica,
} from '@/common/utils/ecValidation-util'

const customerSchema = z
	.object({
		customerType: z.enum(['regular', 'final_consumer']),
		identificationType: z.enum(['04', '05', '06', '07']),
		identificationNumber: z.string().min(1, 'Número de identificación es requerido'),
		firstName: z.string().min(1, 'Nombre es requerido'),
		lastName: z.string().optional(),
		address: z.string().optional(),
		email: z.string().email('Email no válido').optional().or(z.literal('')),
		phone: z.string().optional(),
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
	const methods = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema),
		mode: 'onChange',
		defaultValues: {
			customerType: 'regular',
			identificationType: '05',
			identificationNumber: '',
			firstName: '',
			lastName: '',
			address: '',
			email: '',
			phone: '',
			...defaultValues,
		},
	})

	const {
		handleSubmit,
		reset,
		control,
		formState,
		formState: { errors, isValid, isDirty },
	} = methods

	useEffect(() => {
		if (isOpen) {
			reset({
				customerType: 'regular',
				identificationType: '05',
				identificationNumber: '',
				firstName: '',
				lastName: '',
				address: '',
				email: '',
				phone: '',
				...defaultValues,
			})
		}
	}, [isOpen, defaultValues, reset])

	const handleFormSubmit = async (data: CustomerFormData) => {
		try {
			await onSubmit(data)
			// Solo resetear si la operación fue exitosa
			reset()
		} catch (error) {
			console.error('Error al enviar formulario:', error)
			// NO resetear el formulario en caso de error
			// Los datos del usuario se mantienen para que pueda corregir
		}
	}

	const handleClose = () => {
		reset()
		onClose()
	}

	const identificationType = methods.watch('identificationType')
	useEffect(() => methods.setValue('identificationNumber', ''), [identificationType, methods])

	if (!isOpen) return null

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='z-50 flex max-h-screen min-w-xl flex-col [&>button]:hidden'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentCustomer?.id ? 'Editar Cliente' : 'Crear Cliente'}</SheetTitle>

						<SheetClose>
							<ActionButton
								type='button'
								variant='ghost'
								size='icon'
								disabled={formState.isSubmitting}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</SheetClose>
					</div>

					<SheetDescription>Completa los datos del cliente</SheetDescription>
				</SheetHeader>

				<div className='flex-1 space-y-4 overflow-auto p-4'>
					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
							<div className='space-y-8'>
								{/* Información de identificación */}
								<div className='space-y-4'>
									<CardHeader className='p-0'>
										<CardTitle className='flex items-center gap-2 text-lg'>
											<Icons.id className='h-4 w-4' />
											Información de Identificación
										</CardTitle>
										<CardDescription>Datos de identificación del cliente</CardDescription>
									</CardHeader>

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

										<UniversalFormField
											control={control}
											name='identificationNumber'
											label='Número de identificación'
											placeholder='Ej: 1234567890'
											type='text'
											required
											showValidationIcons
										/>
									</div>
								</div>

								{/* Información personal */}
								<div className='space-y-4'>
									<CardHeader className='p-0'>
										<CardTitle className='flex items-center gap-2 text-lg'>
											<Icons.user className='h-4 w-4' />
											Información Personal
										</CardTitle>
										<CardDescription>Datos personales del cliente</CardDescription>
									</CardHeader>

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
											required
										/>
									</div>

									<UniversalFormField
										control={control}
										name='address'
										label='Dirección'
										placeholder='Ingresa la dirección'
										type='text'
										showValidationIcons
										required
									/>

									<div className='grid grid-cols-2 gap-4'>
										<UniversalFormField
											control={control}
											name='email'
											label='Email'
											placeholder='email@ejemplo.com'
											type='email'
											showValidationIcons
											required
										/>

										<UniversalFormField
											control={control}
											name='phone'
											label='Teléfono'
											placeholder='099 123 4567'
											type='text'
											showValidationIcons
											required
										/>
									</div>
								</div>
							</div>
						</form>
					</FormProvider>
				</div>

				<FormFooter
					formState={formState}
					errors={errors}
					isValid={isValid}
					isDirty={isDirty}
					currentTemplate={currentCustomer}
					onClose={handleClose}
					onSubmit={handleSubmit(handleFormSubmit)}
				/>
			</SheetContent>
		</Sheet>
	)
}
