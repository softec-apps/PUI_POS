'use client'

import { ModalState } from '@/modules/user/types/modalState'
import { I_User, I_CreateUser, I_UpdateUser } from '@/common/types/modules/user'
import { UserFormModal } from '@/modules/user/components/organisms/Modal/ModalUserForm'
import { HardDeleteModal } from '@/modules/user/components/organisms/Modal/ModalHardDelete'
import { SoftDeleteModal } from '@/modules/user/components/organisms/Modal/ModalSoftDelete'

interface UserModalsProps {
	modalState: ModalState
	userHandlers: {
		handleFormSubmit: (data: I_CreateUser | I_UpdateUser) => Promise<void>
		handleDialogClose: () => void
		handleEdit: (record: I_User) => void
		handleConfirmHardDelete: () => Promise<void>
		handleConfirmSoftDelete: () => Promise<void>
	}
}

export function UserModals({ modalState, userHandlers }: UserModalsProps) {
	return (
		<>
			<UserFormModal
				isOpen={modalState.isDialogOpen}
				currentRecord={modalState.currentRecord}
				onClose={userHandlers.handleDialogClose}
				onSubmit={userHandlers.handleFormSubmit}
			/>

			<SoftDeleteModal
				isOpen={modalState.isSoftDeleteModalOpen}
				currentRecord={modalState.recordToSoftDelete}
				isAction={modalState.isSoftDeleting}
				onClose={modalState.closeSoftDeleteModal}
				onConfirm={userHandlers.handleConfirmSoftDelete}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				currentRecord={modalState.recordToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={userHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
