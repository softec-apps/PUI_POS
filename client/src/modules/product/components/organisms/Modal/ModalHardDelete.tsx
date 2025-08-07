'use client'

import { I_Product } from '@/common/types/modules/product'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	currentRecord: I_Product | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar producto'
			description='Esta acción es irreversible.'
			message={
				<>
					¿Confirma que desea eliminar permanentemente el producto{' '}
					<span className='text-foreground font-semibold'>
						{currentRecord?.code} ({currentRecord?.name})
					</span>
					?
				</>
			}
			alertMessage='Esta acción eliminará el producto del sistema de forma permanente, lo que afectará todas las relaciones asociadas.'
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, eliminar'
			cancelText='No, cancelar'
		/>
	)
}
