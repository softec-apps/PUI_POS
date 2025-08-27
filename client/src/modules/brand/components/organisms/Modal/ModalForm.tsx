/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { Icons } from '@/components/icons'
import { useEffect, useState } from 'react'
import { Form } from '@/components/ui/form'
import { I_Brand } from '@/common/types/modules/brand'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { useBrandForm } from '@/modules/brand/hooks/useForm'
import { BrandFormProps, BrandFormData } from '@/modules/brand/types/brand-form'
import { FormFooter } from '@/modules/brand/components/organisms/Form/FooterSection'
import { StatusSection } from '@/modules/brand/components/organisms/Form/StatusSelector'
import { BasicInfoSection } from '@/modules/brand/components/organisms/Form/BasicInfoSection'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'

export function FormModal({ isOpen, currentRecord, onClose, onSubmit }: BrandFormProps) {
	const [recordData, setRecordData] = useState<I_Brand | null>(null)

	const isEditing = !!currentRecord?.id
	const { form, resetForm, setValue, watch } = useBrandForm({ isEditing })

	// Reset form when opening or when user data changes
	useEffect(() => {
		if (isOpen) {
			const dataToUse = recordData || currentRecord
			const initialFormData = {
				name: dataToUse?.name || '',
				description: dataToUse?.description || '',
				status: dataToUse?.status || 'active',
			}
			form.reset(initialFormData)
		}
	}, [isOpen, recordData, currentRecord, form])

	const handleFormSubmit = async (data: BrandFormData) => {
		try {
			await onSubmit(data)
			handleClose()
		} catch (error) {}
	}

	const handleClose = () => {
		resetForm()
		setRecordData(null)
		onClose()
	}

	const isFormValid = form.formState.isValid && !form.formState.isSubmitting
	const formTitle = isEditing ? 'Editar marca' : 'Nueva marca'
	const formDescription = isEditing ? 'Modifica los detalles de la marca existente' : 'Crea una nueva marca'

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='z-50 flex max-h-screen min-w-full flex-col lg:min-w-xl [&>button]:hidden'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 supports- sticky top-0 z-10 border-b p-6 [backdrop-filter]:backdrop-blur-sm'>
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
									<BasicInfoSection control={form.control} />

									{isEditing && <StatusSection control={form.control} />}
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
