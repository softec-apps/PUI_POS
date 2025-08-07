'use client'

import { Icons } from '@/components/icons'
import { SheetFooter } from '@/components/ui/sheet'
import { I_CategoryId } from '@/common/types/modules/category'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface FormFooterProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	formState: any
	isFormValid: boolean
	currentTemplate?: I_CategoryId
	onClose: () => void
	onSubmit: () => void
}

export function FormFooter({ formState, isFormValid, currentTemplate, onClose, onSubmit }: FormFooterProps) {
	const getStatusMessage = () => {
		if (formState.errors && Object.keys(formState.errors).length > 0)
			return `${Object.keys(formState.errors).length} error${Object.keys(formState.errors).length > 1 ? 'es' : ''} por corregir`
		if (isFormValid) return 'Formulario válido y listo para guardar'
		return 'Completa todos los campos requeridos'
	}

	const getStatusColor = () => {
		if (formState.errors && Object.keys(formState.errors).length > 0) return 'text-destructive'
		if (isFormValid) return 'text-emerald-500'
		return 'text-cyan-500'
	}

	return (
		<SheetFooter className='bg-muted/20 border-t'>
			<div className='flex w-full items-center justify-between gap-4'>
				<span className={`${getStatusColor()} flex items-center gap-1 text-sm`}>
					<Icons.infoCircle className='h-4 w-4' />
					{getStatusMessage()}
				</span>

				<div className='flex gap-3'>
					<ActionButton
						type='button'
						variant='ghost'
						onClick={onClose}
						disabled={formState.isSubmitting}
						text='Cancelar'
						icon={<Icons.x className='h-4 w-4' />}
					/>

					<ActionButton
						type='submit'
						onClick={onSubmit}
						disabled={!isFormValid}
						text={formState.isSubmitting ? 'Guardando...' : currentTemplate?.id ? 'Actualizar' : 'Crear Plantilla'}
						icon={
							formState.isSubmitting ? (
								<Icons.spinnerSimple className='h-4 w-4 animate-spin' />
							) : (
								<Icons.deviceFloppy className='h-4 w-4' />
							)
						}
					/>
				</div>
			</div>
		</SheetFooter>
	)
}
