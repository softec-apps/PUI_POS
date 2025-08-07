'use client'

import { I_Attribute } from '@/common/types/modules/attribute'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	currentRecord: I_Attribute | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar atributo'
			description='Esta acción es irreversible.'
			message={
				<>
					¿Confirma que desea eliminar permanentemente el atributo{' '}
					<span className='text-foreground font-semibold'>{currentRecord?.name}</span>? Este atributo está en uso y será
					removido de la plantilla de creación de productos.
				</>
			}
			alertMessage='Esta acción eliminará el atributo de la base de datos de forma permanente.'
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, eliminar'
			cancelText='No, cancelar'
		/>
	)
}
