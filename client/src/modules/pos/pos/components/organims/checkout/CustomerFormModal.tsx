'use client'

import { z } from 'zod'
import React, { useEffect } from 'react'
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
	} = methods

	useEffect(() => {
		if (isOpen) {
			reset({
				customerType: 'regular',
				identificationType: '05',
				identificationNumber: '',
				firstName: '',
				lastName: '',
				email: '',
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

					<DialogDescription>Completa los datos del cliente</DialogDescription>
				</DialogHeader>

				<div className='flex-1 space-y-4 overflow-auto p-4'>
					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
							<div className='space-y-8'>
								{/* Información de identificación */}
								<div className='space-y-8'>
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

				<FormFooter
					formState={formState}
					isFormValid={isValid} // <-- antes pasabas isValid pero el prop se llama isFormValid
					currentRecord={currentCustomer} // <-- antes usabas currentTemplate
					onClose={handleClose}
					onSubmit={handleSubmit(handleFormSubmit)}
				/>
			</DialogContent>
		</Dialog>
	)
}
