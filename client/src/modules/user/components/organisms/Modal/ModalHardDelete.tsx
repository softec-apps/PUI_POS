'use client'

import { I_User } from '@/common/types/modules/user'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface HardDeleteModalProps {
	isOpen: boolean
	currentRecord: I_User | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: HardDeleteModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar usuario'
			description='Esta acción no se puede deshacer'
			message={
				<>
					¿Deseas eliminar permanentemente al usuario{' '}
					<span className='text-foreground font-semibold'>
						{currentRecord?.email} ({currentRecord?.firstName} {currentRecord?.lastName})
					</span>
					?
				</>
			}
			alertMessage={
				<>
					<p className='text-destructive'>El usuario perderá acceso al sistema de forma definitiva.</p>
					<p className='text-destructive'>Sus relaciones quedaran huerfanas</p>
				</>
			}
			confirmKey={currentRecord?.email}
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Eliminar'
			cancelText='Cancelar'
		/>
	)
}
