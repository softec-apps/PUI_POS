'use client'

import { I_Category } from '@/common/types/modules/category'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface HardDeleteModalProps {
	isOpen: boolean
	currentRecord: I_Category | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: HardDeleteModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar categoría'
			description='Esta acción no se puede deshacer'
			message={
				<>
					¿Deseas eliminar permanentemente la categoría{' '}
					<span className='text-foreground font-semibold'>{currentRecord?.name}</span>?
				</>
			}
			alertMessage={
				<>
					<p className='text-destructive'>Esta categoría será eliminada de forma permanente y no podrá recuperarse.</p>
					<p className='text-destructive'>Todos los productos relacionados quedarán sin categoría asignada.</p>
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
