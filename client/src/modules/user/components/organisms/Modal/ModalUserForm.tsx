'use client'

import { Icons } from '@/components/icons'
import { useEffect, useState } from 'react'
import { Form } from '@/components/ui/form'
import { useRole } from '@/common/hooks/useRole'
import { I_User } from '@/common/types/modules/user'
import { useStatus } from '@/common/hooks/useStatus'
import { useUserForm } from '@/modules/user/hooks/useUserForm'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { UserFormProps, UserFormData } from '@/modules/user/types/user-form'
import { FormFooter } from '@/modules/user/components/organisms/Form/FooterSection'
import { RolSection } from '@/modules/user/components/organisms/Form/RolSelector'
import { MediaSection } from '@/modules/user/components/organisms/Form/MediaSection'
import { StatusSection } from '@/modules/user/components/organisms/Form/StatusSelector'
import { SecuritySection } from '@/modules/user/components/organisms/Form/SecuritySection'
import { BasicInfoSection } from '@/modules/user/components/organisms/Form/BasicInfoSection'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'

export function UserFormModal({ isOpen, currentRecord, onClose, onSubmit }: UserFormProps) {
	const { recordsData: rolesData, loading: loadingRoles } = useRole()
	const { recordsData: statusesData, loading: loadingStatuses } = useStatus()

	const [userData, setUserData] = useState<I_User | null>(null)

	const isEditing = !!currentRecord?.id
	const { form, resetForm, setValue, watch } = useUserForm({ isEditing })

	// Reset form when opening or when user data changes
	useEffect(() => {
		if (isOpen) {
			const dataToUse = userData || currentRecord
			const initialFormData = {
				firstName: dataToUse?.firstName || '',
				lastName: dataToUse?.lastName || '',
				email: dataToUse?.email || '',
				dni: dataToUse?.dni || '',
				statusId: String(dataToUse?.status?.id || ''),
				roleId: String(dataToUse?.role?.id || ''),
				photo: dataToUse?.photo || '',
				removePhoto: false,
			}
			form.reset(initialFormData)
		}
	}, [isOpen, userData, currentRecord, form])

	const handleFormSubmit = async (data: UserFormData) => {
		try {
			const formattedData = {
				...data,
				role: { id: parseInt(data.roleId, 10) },
				status: { id: parseInt(data.statusId, 10) },
			}

			delete formattedData?.roleId
			delete formattedData?.statusId

			await onSubmit(formattedData)
			handleClose()
		} catch (error) {
			console.error('Form submission error:', error)
		}
	}

	const handleClose = () => {
		resetForm()
		setUserData(null)
		onClose()
	}

	const isFormValid = form.formState.isValid && !form.formState.isSubmitting
	const formTitle = isEditing ? 'Editar usuario' : 'Nuevo usuario'
	const formDescription = isEditing ? 'Modifica los detalles de tu usuario existente' : 'Crea un nuevo usuario'

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='z-50 flex max-h-screen min-w-full flex-col'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b p-6 supports-[backdrop-filter]:backdrop-blur-sm'>
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
							<div className='grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-14'>
								<div className='space-y-8'>
									<BasicInfoSection control={form.control} />

									{!isEditing && <SecuritySection control={form.control} isEditing={isEditing} />}

									{isEditing && (
										<StatusSection
											control={form.control}
											statuses={statusesData?.data.items || []}
											isLoadingStatuses={loadingStatuses}
										/>
									)}
								</div>

								<div className='space-y-8'>
									<div className='space-y-6'>
										<RolSection
											control={form.control}
											roles={rolesData?.data.items || []}
											isLoadingRoles={loadingRoles}
											setValue={setValue}
											watch={watch}
										/>
									</div>

									<MediaSection
										control={form.control}
										setValue={setValue} // Use the destructured setValue
										watch={watch} // Use the destructured watch
									/>
								</div>
							</div>
						</form>
					</Form>
				</div>

				<FormFooter
					formState={form.formState}
					isFormValid={isFormValid}
					currentRecord={userData || currentRecord}
					onClose={handleClose}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				/>
			</SheetContent>
		</Sheet>
	)
}
