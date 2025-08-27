/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { I_Brand } from '@/common/types/modules/brand'
import { FormModal } from '@/modules/brand/components/organisms/Modal/ModalForm'
import { HardDeleteModal } from '@/modules/brand/components/organisms/Modal/ModalHardDelete'
import { SoftDeleteModal } from '@/modules/brand/components/organisms/Modal/ModalSoftDelete'
import { RestoreModal } from '@/modules/brand/components/organisms/Modal/ModalRestore'

interface ModalsProps {
	modal: {
		type: 'create' | 'edit' | 'hardDelete' | 'softDelete' | 'restore' | null
		isOpen: boolean
		record: I_Brand | null
		isLoading: boolean
		closeModal: () => void
	}
	onSubmit: (data: any) => Promise<void>
	onDelete: () => Promise<void>
	onRestore: () => Promise<void>
}

export function Modals({ modal, onSubmit, onDelete, onRestore }: ModalsProps) {
	const isFormModal = modal.type === 'create' || modal.type === 'edit'
	const isRestoreModal = modal.type === 'restore'

	return (
		<>
			<FormModal
				isOpen={isFormModal && modal.isOpen}
				currentRecord={modal.record}
				onClose={modal.closeModal}
				onSubmit={onSubmit}
				isLoading={modal.isLoading}
			/>

			<SoftDeleteModal
				isOpen={modal.type === 'softDelete' && modal.isOpen}
				currentRecord={modal.record}
				isAction={modal.isLoading}
				onClose={modal.closeModal}
				onConfirm={onDelete}
			/>

			<HardDeleteModal
				isOpen={modal.type === 'hardDelete' && modal.isOpen}
				currentRecord={modal.record}
				isAction={modal.isLoading}
				onClose={modal.closeModal}
				onConfirm={onDelete}
			/>

			{isRestoreModal && (
				<RestoreModal
					isOpen={modal.isOpen}
					currentRecord={modal.record}
					isAction={modal.isLoading}
					onClose={modal.closeModal}
					onConfirm={onRestore}
				/>
			)}
		</>
	)
}
