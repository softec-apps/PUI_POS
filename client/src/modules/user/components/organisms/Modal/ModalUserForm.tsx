'use client'

import { useEffect, useState } from 'react'
import { Form } from '@/components/ui/form'

import { useRole } from '@/common/hooks/useRole'
import { I_User } from '@/common/types/modules/user'
import { useStatus } from '@/common/hooks/useStatus'
import { useUserForm } from '@/modules/user/hooks/useUserForm'

import { UserFormProps, UserFormData } from '@/modules/user/types/user-form'

import { Icons } from '@/components/icons'
import { FormFooter } from '@/modules/user/components/organisms/Form/FormFooter'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'

import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { RolSection } from '@/modules/user/components/organisms/Form/RolSelector'
import { MediaSection } from '@/modules/user/components/organisms/Form/MediaSection'
import { StatusSection } from '@/modules/user/components/organisms/Form/StatusSelector'
import { SecuritySection } from '@/modules/user/components/organisms/Form/SecuritySection'
import { BasicInfoSection } from '@/modules/user/components/organisms/Form/BasicInfoSection'

export function UserFormModal({ isOpen, currentRecord, onClose, onSubmit }: UserFormProps) {
	const { recordsData: rolesData, loading: loadingRoles } = useRole()
	const { recordsData: statusesData, loading: loadingStatuses } = useStatus()
	const [userData, setUserData] = useState<I_User | null>(null)

	const isEditing = !!currentRecord?.id
	const { form, resetForm } = useUserForm({ isEditing })

	// Reset form with complete user data
	useEffect(() => {
		if (isOpen) {
			const dataToUse = userData || currentRecord

			form.reset({
				firstName: dataToUse?.firstName || '',
				lastName: dataToUse?.lastName || '',
				email: dataToUse?.email || '',
				statusId: String(dataToUse?.status?.id || ''),
				roleId: String(dataToUse?.role?.id || ''),
				photo: dataToUse?.photo || '',
				removePhoto: false,
			})
		}
	}, [isOpen, userData, currentRecord, form])

	const handleFormSubmit = async (data: UserFormData) => {
		try {
			const formattedData = {
				...data,
				photo: data.photo === '' ? null : data.photo,
			}

			await onSubmit(formattedData)
			handleClose()
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClose = () => {
		resetForm()
		setUserData(null)
		onClose()
	}

	const isFormValid = form.formState.isValid && !form.formState.isSubmitting

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='z-50 flex max-h-screen min-w-xl flex-col [&>button]:hidden'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentRecord?.id ? 'Editar usuario' : 'Nuevo usuario'}</SheetTitle>
						<SheetClose>
							<ActionButton
								type='button'
								variant='ghost'
								onClick={onClose}
								size='icon'
								disabled={form.formState.isSubmitting}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</SheetClose>
					</div>

					<SheetDescription>
						{currentRecord?.id ? 'Modifica los detalles de tu usuario existente' : 'Crea un nuevo usuario'}
					</SheetDescription>
				</SheetHeader>

				{/* Content */}
				<div className='flex-1 space-y-4 overflow-auto p-4'>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleFormSubmit)}>
							<div className='space-y-12'>
								<BasicInfoSection control={form.control} />

								<MediaSection control={form.control} setValue={form.setValue} watch={form.watch} />

								{!isEditing && <SecuritySection control={form.control} isEditing={isEditing} />}

								<RolSection control={form.control} roles={rolesData?.data.items || []} isLoadingRoles={loadingRoles} />

								{isEditing && (
									<StatusSection
										control={form.control}
										statuses={statusesData?.data.items || []}
										isLoadingStatuses={loadingStatuses}
									/>
								)}
							</div>
						</form>
					</Form>
				</div>

				{/* Footer */}
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
