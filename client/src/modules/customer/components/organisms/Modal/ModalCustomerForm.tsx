'use client'

import { z } from 'zod'
import React, { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'

import { Icons } from '@/components/icons'
import { I_Customer } from '@/common/types/modules/customer'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { FormFooter } from '@/modules/customer/components/organisms/Modal/FormFooter'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { CustomerType, IdentificationType } from '@/common/enums/customer.enum'
import { CustomerTypeES, identificationTypeOptions, IdentificationLabelsES } from '@/common/constants/customer-const'
import { validateCedula, validateEcuadorianRUC } from '@/common/utils/ecValidation-util'

const customerSchema = z
	.object({
		firstName: z.string().min(1, 'Campo requerido'),
		lastName: z.string().min(1, 'Campo requerido'),
		email: z.string().email('Email inválido').optional(),
		phone: z.string().optional(),
		address: z.string().optional(),
		identificationType: z.enum([
			IdentificationType.RUC,
			IdentificationType.IDENTIFICATION_CARD,
			IdentificationType.PASSPORT,
			IdentificationType.FINAL_CONSUMER,
		]),
		identificationNumber: z.string().min(1, 'Campo requerido'),
		customerType: z.enum([CustomerType.REGULAR, CustomerType.FINAL_CONSUMER]),
	})
	.superRefine((data, ctx) => {
		// Validaciones según tipo de cliente
		if (data.customerType === CustomerType.FINAL_CONSUMER) {
			if (data.identificationNumber !== '9999999999999') {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['identificationNumber'],
					message: 'Para consumidor final debe ser 9999999999999',
				})
			}
			return
		} else if (data.customerType === CustomerType.REGULAR) {
			if (!data.email) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: 'Campo requerido' })
			if (!data.phone) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: 'Campo requerido' })
			if (!data.address) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['address'], message: 'Campo requerido' })
		}

		// Validación según tipo de identificación
		const id = data.identificationNumber
		switch (data.identificationType) {
			case IdentificationType.IDENTIFICATION_CARD:
				if (!validateCedula(id)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['identificationNumber'],
						message: 'Cédula inválida',
					})
				}
				break
			case IdentificationType.RUC:
				if (!validateEcuadorianRUC(id)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['identificationNumber'],
						message: 'RUC inválido',
					})
				}
				break
			case IdentificationType.FINAL_CONSUMER:
				// Ya validado arriba
				break
			case IdentificationType.PASSPORT:
				if (!id || id.length < 3) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['identificationNumber'],
						message: 'Pasaporte inválido',
					})
				}
				break
		}
	})

export type CustomerFormData = z.infer<typeof customerSchema>

interface Props {
	isOpen: boolean
	currentCustomer: I_Customer | null
	onClose: () => void
	onSubmit: (data: CustomerFormData) => Promise<void>
}

export const customerTypeOptions = Object.values(CustomerType).map(type => ({
	value: type,
	label: CustomerTypeES[type],
	description: type === CustomerType.FINAL_CONSUMER ? 'Sin identificación registrada' : 'Con identificación personal',
	icon: <Icons.user className='h-6 w-6' />,
}))

export function CustomerFormModal({ isOpen, currentCustomer, onClose, onSubmit }: Props) {
	const methods = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema),
		mode: 'all',
	})

	const {
		handleSubmit,
		reset,
		control,
		watch,
		trigger,
		setValue,
		formState: { errors, isValid, isDirty },
		formState,
	} = methods

	const customerType = watch('customerType')
	const identificationType = watch('identificationType')

	useEffect(() => {
		if (identificationType) trigger('identificationNumber')
	}, [identificationType, trigger])

	React.useEffect(() => {
		if (customerType === CustomerType.FINAL_CONSUMER) {
			setValue('identificationType', IdentificationType.FINAL_CONSUMER, { shouldValidate: false })
			setValue('identificationNumber', '9999999999999', { shouldValidate: false })
			setValue('firstName', IdentificationLabelsES.FINAL_CUSTOMER_ES, { shouldValidate: false })
			setValue('lastName', IdentificationLabelsES.FINAL_CUSTOMER_ES, { shouldValidate: false })
			setValue('email', 'final@final.com', { shouldValidate: false })
			setValue('phone', '999999999', { shouldValidate: false })
			setValue('address', IdentificationLabelsES.FINAL_CUSTOMER_ES, { shouldValidate: false })
		} else if (customerType === CustomerType.REGULAR) {
			setValue('identificationType', IdentificationType.IDENTIFICATION_CARD, { shouldValidate: false })
			setValue('identificationNumber', '', { shouldValidate: false })
			setValue('firstName', '', { shouldValidate: false })
			setValue('lastName', '', { shouldValidate: false })
			setValue('email', '', { shouldValidate: false })
			setValue('phone', '', { shouldValidate: false })
			setValue('address', '', { shouldValidate: false })
		}
		// Solo disparar validación después de limpiar
		trigger()
	}, [customerType, setValue, trigger])

	React.useEffect(() => {
		if (isOpen) {
			if (currentCustomer) {
				reset({
					firstName: currentCustomer.firstName || '',
					lastName: currentCustomer.lastName || '',
					email: currentCustomer.email || '',
					phone: currentCustomer.phone || '',
					address: currentCustomer.address || '',
					identificationType: currentCustomer.identificationType,
					identificationNumber: currentCustomer.identificationNumber,
					customerType: currentCustomer.customerType,
				})
			} else {
				reset({
					firstName: '',
					lastName: '',
					email: '',
					phone: '',
					address: '',
					identificationType: IdentificationType.IDENTIFICATION_CARD,
					identificationNumber: '',
					customerType: CustomerType.REGULAR,
				})
			}
		}
	}, [isOpen, currentCustomer, reset])

	const handleFormSubmit = async (data: CustomerFormData) => {
		try {
			await onSubmit(data)
			reset()
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClose = () => {
		reset()
		onClose()
	}

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='flex w-full flex-col sm:max-w-xl'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentCustomer ? 'Editar Cliente' : 'Crear Cliente'}</SheetTitle>
						<SheetClose>
							<ActionButton type='button' variant='ghost' size='icon' icon={<Icons.x className='h-4 w-4' />} />
						</SheetClose>
					</div>
					<SheetDescription>
						{currentCustomer
							? 'Modifica los detalles del cliente existente'
							: 'Completa los campos para crear un nuevo cliente'}
					</SheetDescription>
				</SheetHeader>

				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(handleFormSubmit)} className='flex-1 space-y-8 overflow-auto p-4'>
						{/* Sección Tipo de Cliente */}
						<div className='space-y-2'>
							<RadioGroup
								defaultValue={CustomerType.REGULAR}
								className='grid grid-cols-2 gap-4'
								value={customerType}
								onValueChange={value =>
									setValue('customerType', value as CustomerType.REGULAR | CustomerType.FINAL_CONSUMER)
								}>
								{customerTypeOptions.map(option => (
									<div key={option.value}>
										<RadioGroupItem value={option.value} id={option.value} className='peer sr-only' />
										<Label
											htmlFor={option.value}
											className={cn(
												'bg-card dark:bg-card/50 hover:bg-accent/20 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-xl border p-4 transition-all duration-500',
												customerType === option.value && 'border-primary bg-accent/50'
											)}>
											{option.icon}
											<div className='text-base'>{option.label}</div>
											<CardDescription className='mt-2 text-center text-sm'>{option.description}</CardDescription>
										</Label>
									</div>
								))}
							</RadioGroup>
						</div>

						<Card className='border-none bg-transparent p-0 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.id className='h-4 w-4' />
									Información de Identificación
								</CardTitle>
							</CardHeader>

							<div className='grid grid-cols-2 gap-4'>
								<UniversalFormField
									control={control}
									name='identificationType'
									label='Tipo de Identificación'
									type='select'
									options={
										customerType === CustomerType.FINAL_CONSUMER
											? [{ value: '07', label: 'Consumidor Final' }]
											: identificationTypeOptions.filter(opt => opt.value !== IdentificationType.FINAL_CONSUMER)
									}
									required
									disabled={customerType === CustomerType.FINAL_CONSUMER}
								/>
								<UniversalFormField
									control={control}
									name='identificationNumber'
									label='Número de Identificación'
									placeholder='1234567890'
									type='text'
									required
									disabled={customerType === CustomerType.FINAL_CONSUMER}
								/>
							</div>
						</Card>

						<Card className='border-none bg-transparent p-0 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.user className='h-4 w-4' />
									Información Personal
								</CardTitle>
							</CardHeader>

							<UniversalFormField
								control={control}
								name='firstName'
								label='Nombres'
								placeholder='Jon Doe'
								type='text'
								required
								disabled={customerType === CustomerType.FINAL_CONSUMER}
							/>

							<UniversalFormField
								control={control}
								name='lastName'
								label='Apellidos'
								placeholder='Jon Doe'
								type='text'
								required
								disabled={customerType === CustomerType.FINAL_CONSUMER}
							/>

							{customerType === CustomerType.REGULAR && (
								<>
									<UniversalFormField
										control={control}
										name='email'
										label='Correo Electrónico'
										placeholder='ejemplo@correo.com'
										type='email'
										required={CustomerType.REGULAR ? true : false}
									/>

									<UniversalFormField
										control={control}
										name='phone'
										label='Teléfono'
										placeholder='+593987654321'
										type='text'
										required={CustomerType.REGULAR ? true : false}
									/>
									<UniversalFormField
										control={control}
										name='address'
										label='Dirección'
										placeholder='Av. Principal 123'
										type='textarea'
										required={CustomerType.REGULAR ? true : false}
									/>
								</>
							)}
						</Card>
					</form>
				</FormProvider>

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
