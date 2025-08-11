'use client'

import { z } from 'zod'
import { useEffect } from 'react'
import { Icons } from '@/components/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'

import { validateEcuadorianRUC } from '@/common/utils/ecValidation-util'

import { AlertMessage } from '@/components/layout/atoms/Alert'
import { I_Supplier } from '@/common/types/modules/supplier'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { FormFooter } from '@/modules/supplier/components/organisms/Modal/FormFooter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'

const supplierSchema = z.object({
	ruc: z
		.string()
		.nonempty('No puede estar vacío')
		.refine(value => /^\d*$/.test(value), {
			message: 'Formato invalido',
		})
		.refine(value => value.length === 13, {
			message: 'Debe tener exactamente 13 caracteres',
		})
		.refine(
			value => {
				// Solo validar algoritmo si ya tiene 13 dígitos y son solo números
				if (value.length === 13 && /^\d{13}$/.test(value)) {
					try {
						return validateEcuadorianRUC(value)
					} catch (error) {
						console.log('Error validando RUC:', error)
						return false
					}
				}
				// Si no tiene 13 dígitos, no ejecutar esta validación
				return true
			},
			{
				message: 'RUC ingresado no es válido',
			}
		),
	legalName: z.string().max(300, 'Límite de 300 caracteres excedido').nonempty('No puede estar vacío'),
	commercialName: z.string().max(300, 'Límite de 300 caracteres excedido').optional(),
})

export type supplierFormData = z.infer<typeof supplierSchema>

interface Props {
	isOpen: boolean
	currentRecord: I_Supplier | null
	onClose: () => void
	onSubmit: (data: supplierFormData) => Promise<void>
}

export function RecordFormModal({ isOpen, currentRecord, onClose, onSubmit }: Props) {
	const methods = useForm<supplierFormData>({
		resolver: zodResolver(supplierSchema),
		mode: 'onChange',
		defaultValues: {
			ruc: '',
			legalName: '',
			commercialName: '',
		},
	})

	const { handleSubmit, reset, control, formState } = methods

	const { errors, isSubmitting, isValid, isDirty } = formState

	// Efecto para cargar datos cuando se abre para editar
	useEffect(() => {
		if (isOpen && currentRecord) {
			reset({
				ruc: currentRecord.ruc || '',
				legalName: currentRecord.legalName || '',
				commercialName: currentRecord.commercialName || '',
			})
		} else if (isOpen && !currentRecord) {
			reset({
				ruc: '',
				legalName: '',
				commercialName: '',
			})
		}
	}, [isOpen, currentRecord, reset])

	const handleFormSubmit = async (data: supplierFormData) => {
		try {
			const submitData = {
				...data,
			}

			await onSubmit(submitData)

			// Limpiar formulario después del envío exitoso
			reset({
				ruc: '',
				legalName: '',
				commercialName: '',
			})
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClose = () => {
		// Limpiar formulario y estado
		reset({
			ruc: '',
			legalName: '',
			commercialName: '',
		})
		onClose()
	}

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='flex max-h-screen min-w-xl flex-col'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentRecord ? 'Editar proveedor' : 'Crear proveedor'}</SheetTitle>
						<SheetClose>
							<ActionButton
								type='button'
								variant='ghost'
								onClick={onClose}
								size='icon'
								disabled={isSubmitting}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</SheetClose>
					</div>

					<SheetDescription>
						{currentRecord
							? 'Modifica los campos del proveedor existente'
							: 'Completa los campos para crear un nuevo proveedor'}
					</SheetDescription>
				</SheetHeader>

				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(handleFormSubmit)} className='flex-1 space-y-6 overflow-auto p-4'>
						<Card className='border-none bg-transparent p-0 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.infoCircle className='h-4 w-4' />
									Información básica
								</CardTitle>
								<CardDescription>Datos básicos del proveedor</CardDescription>
							</CardHeader>

							<CardContent className='space-y-4 p-0'>
								<UniversalFormField
									control={control}
									name='ruc'
									label='RUC'
									placeholder='Ej. 1790012345001'
									type='text'
									required={true}
									showValidationIcons={true}
								/>

								<UniversalFormField
									control={control}
									name='legalName'
									label='Razón social (nombre legal)'
									placeholder='Ej. COMERCIALIZADORA ANDINA S.A.'
									type='text'
									required={true}
									showValidationIcons={true}
								/>

								<UniversalFormField
									control={control}
									name='commercialName'
									label='Nombre comercial'
									placeholder='Ej. DISTRIANDINA'
									type='text'
									required={false}
									showValidationIcons={true}
								/>
							</CardContent>
						</Card>
					</form>
				</FormProvider>

				<FormFooter
					formState={formState}
					errors={errors}
					isValid={isValid}
					isDirty={isDirty}
					currentRecord={currentRecord}
					onClose={handleClose}
					onSubmit={handleSubmit(handleFormSubmit)}
				/>
			</SheetContent>
		</Sheet>
	)
}
