/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState, useRef } from 'react'
import { I_Customer } from '@/common/types/modules/customer'
import { useCustomerForm } from '@/modules/customer/hooks/useForm'
import { CustomerType, IdentificationType } from '@/common/enums/customer.enum'

import { Icons } from '@/components/icons'
import { Form } from '@/components/ui/form'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { FormFooter } from '@/modules/customer/components/organisms/Form/FooterSection'
import { CustomerFormProps, CustomerFormData } from '@/modules/customer/types/customer-form'
import { BasicInfoSection } from '@/modules/customer/components/organisms/Form/BasicInfoSection'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'

export function FormModal({ isOpen, currentRecord, onClose, onSubmit }: CustomerFormProps) {
	const [recordData, setRecordData] = useState<I_Customer | null>(null)
	const originalFormData = useRef<CustomerFormData | null>(null)
	const isEditing = !!currentRecord?.id
	const { form, resetForm, setValue, watch } = useCustomerForm({ isEditing })

	// Reset form when opening or when user data changes
	useEffect(() => {
		if (isOpen) {
			const dataToUse = recordData || currentRecord
			// Mapear datos del customer actual al formato del formulario
			const initialFormData: Partial<CustomerFormData> = {
				firstName: dataToUse?.firstName || '',
				lastName: dataToUse?.lastName || '',
				email: dataToUse?.email || '',
				phone: dataToUse?.phone || '',
				address: dataToUse?.address || '',
				identificationNumber: dataToUse?.identificationNumber || '',
				identificationType: dataToUse?.identificationType || IdentificationType.IDENTIFICATION_CARD,
				customerType: dataToUse?.customerType || CustomerType.REGULAR,
			}

			// Guardar los datos originales para poder restaurarlos
			if (isEditing && dataToUse) {
				originalFormData.current = {
					firstName: dataToUse.firstName || '',
					lastName: dataToUse.lastName || '',
					email: dataToUse.email || '',
					phone: dataToUse.phone || '',
					address: dataToUse.address || '',
					identificationNumber: dataToUse.identificationNumber || '',
					identificationType: dataToUse.identificationType || IdentificationType.IDENTIFICATION_CARD,
					customerType: dataToUse.customerType || CustomerType.REGULAR,
				}
			} else {
				originalFormData.current = null
			}

			form.reset(initialFormData)
		}
	}, [isOpen, recordData, currentRecord, form, isEditing])

	const handleFormSubmit = async (data: CustomerFormData) => {
		try {
			await onSubmit(data)
			handleClose()
		} catch (error) {
			console.error('Error submitting form:', error)
		}
	}

	const handleClose = () => {
		resetForm()
		setRecordData(null)
		originalFormData.current = null
		onClose()
	}

	const isFormValid = form.formState.isValid && !form.formState.isSubmitting
	const formTitle = isEditing ? 'Editar cliente' : 'Nuevo cliente'
	const formDescription = isEditing
		? 'Modifica los detalles del cliente existente'
		: 'Crea un nuevo cliente en el sistema'

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='z-50 flex max-h-screen min-w-full flex-col [&>button]:hidden'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b p-6 backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{formTitle}</SheetTitle>
						<SheetClose asChild>
							<ActionButton
								type='button'
								variant='ghost'
								onClick={onClose}
								size='icon'
								disabled={form.formState.isSubmitting}
								icon={<Icons.x className='h-4 w-4' />}
								aria-label='Close form'
							/>
						</SheetClose>
					</div>
					<SheetDescription>{formDescription}</SheetDescription>
				</SheetHeader>

				<div className='flex-1 space-y-4 overflow-auto p-6'>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-12'>
							<div className='grid grid-cols-1 gap-8 md:grid-cols-1 md:gap-14'>
								<div className='space-y-8'>
									<BasicInfoSection control={form.control} originalData={originalFormData.current} />
								</div>
							</div>
						</form>
					</Form>
				</div>

				<FormFooter
					formState={form.formState}
					isFormValid={isFormValid}
					currentRecord={recordData || currentRecord}
					onClose={handleClose}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				/>
			</SheetContent>
		</Sheet>
	)
}
