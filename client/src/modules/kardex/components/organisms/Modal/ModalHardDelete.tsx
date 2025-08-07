'use client'

import { I_Template } from '@/common/types/modules/template'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	template: I_Template | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, template, isAction, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar atributo'
			description='Esta acción es irreversible.'
			message={
				<>
					¿Confirma que desea eliminar permanentemente la plantilla{' '}
					<span className='text-foreground font-semibold'>{template?.name}</span>?
				</>
			}
			alertMessage='Esta acción eliminará la plantilla de la base de datos de forma permanente, lo que afectará todas las relaciones asociadas en el sistema.'
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, eliminar'
			cancelText='No, cancelar'
		/>
	)
}
