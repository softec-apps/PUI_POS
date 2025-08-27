/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { I_User } from '@/common/types/modules/user'
import { UserFormModal } from '@/modules/user/components/organisms/Modal/ModalUserForm'
import { HardDeleteModal } from '@/modules/user/components/organisms/Modal/ModalHardDelete'
import { SoftDeleteModal } from '@/modules/user/components/organisms/Modal/ModalSoftDelete'
import { RestoreModal } from '@/modules/user/components/organisms/Modal/ModalRestore'

interface UserModalsProps {
	modal: {
		type: 'create' | 'edit' | 'hardDelete' | 'softDelete' | 'restore' | null
		isOpen: boolean
		record: I_User | null
		isLoading: boolean
		closeModal: () => void
	}
	onSubmit: (data: any) => Promise<void>
	onDelete: () => Promise<void>
	onRestore: () => Promise<void>
}

export function UserModals({ modal, onSubmit, onDelete, onRestore }: UserModalsProps) {
	const isFormModal = modal.type === 'create' || modal.type === 'edit'
	const isRestoreModal = modal.type === 'restore'

	return (
		<>
			<UserFormModal
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
