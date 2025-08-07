'use client'

import { Icons } from '@/components/icons'
import { SheetFooter } from '@/components/ui/sheet'
import { FieldErrors, FormState } from 'react-hook-form'
import { I_BrandId } from '@/common/types/modules/brand'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface FormFooterProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	formState: FormState<any>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	errors: FieldErrors<any>
	isValid: boolean
	isDirty: boolean
	isUploading?: boolean
	currentTemplate?: I_BrandId
	onClose: () => void
	onSubmit: () => void
}

export function FormFooter({
	formState,
	errors,
	isValid,
	isDirty,
	isUploading = false,
	currentTemplate,
	onClose,
	onSubmit,
}: FormFooterProps) {
	const { isSubmitting } = formState
	const errorCount = Object.keys(errors).length
	const hasErrors = errorCount > 0

	const getStatusMessage = () => {
		if (hasErrors) return `${errorCount} error${errorCount > 1 ? 'es' : ''} por corregir`
		if (isValid && isDirty) return 'Formulario válido y listo para guardar'
		if (isValid && !isDirty && currentTemplate?.id) return 'Sin cambios para guardar'
		return 'Completa los campos requeridos'
	}

	const getStatusColor = () => {
		if (hasErrors) return 'text-destructive'
		if (isValid && isDirty) return 'text-emerald-500'
		if (isValid && !isDirty && currentTemplate?.id) return 'text-amber-500'
		return 'text-cyan-500'
	}

	const getStatusIcon = () => {
		if (hasErrors) return <Icons.alertCircle className='h-4 w-4' />
		if (isValid && isDirty) return <Icons.checkCircle className='h-4 w-4' />
		if (isValid && !isDirty && currentTemplate?.id) return <Icons.infoCircle className='h-4 w-4' />
		return <Icons.infoCircle className='h-4 w-4' />
	}

	const isDisabled = isSubmitting || isUploading || !isValid || (!isDirty && currentTemplate?.id)

	const getButtonText = () => {
		if (isUploading) return 'Procesando...'
		if (isSubmitting) return 'Guardando...'
		return currentTemplate?.id ? 'Actualizar' : 'Crear Plantilla'
	}

	const getButtonIcon = () => {
		if (isUploading || isSubmitting) {
			return <Icons.spinnerSimple className='h-4 w-4 animate-spin' />
		}
		return <Icons.deviceFloppy className='h-4 w-4' />
	}

	return (
		<SheetFooter className='bg-background border-t'>
			<div className='flex w-full items-center justify-between gap-4'>
				<span className={`${getStatusColor()} flex items-center gap-1 text-sm font-medium`}>
					{getStatusIcon()}
					{getStatusMessage()}
				</span>

				<div className='flex gap-3'>
					<ActionButton
						type='button'
						variant='ghost'
						onClick={onClose}
						disabled={isSubmitting || isUploading}
						text='Cancelar'
						icon={<Icons.x className='h-4 w-4' />}
					/>

					<ActionButton
						type='submit'
						onClick={onSubmit}
						disabled={isDisabled}
						text={getButtonText()}
						icon={getButtonIcon()}
					/>
				</div>
			</div>
		</SheetFooter>
	)
}
