'use client'

import { I_Brand } from '@/common/types/modules/brand'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface HardDeleteModalProps {
	isOpen: boolean
	currentRecord: I_Brand | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: HardDeleteModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar marca'
			description='Esta acción no se puede deshacer'
			message={
				<>
					¿Deseas eliminar permanentemente lamarca{' '}
					<span className='text-foreground font-semibold'>{currentRecord?.name}</span>?
				</>
			}
			alertMessage={
				<>
					<p className='text-destructive'>Esta marca será eliminada de forma permanente y no podrá recuperarse.</p>
					<p className='text-destructive'>Todos los productos relacionados quedarán sin marca asignada.</p>
				</>
			}
			confirmKey={currentRecord?.name}
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Eliminar'
			cancelText='Cancelar'
		/>
	)
}
