/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { ModalType } from '@/modules/supplier/types/modal'
import { I_Supplier } from '@/common/types/modules/supplier'
import { FormModal } from '@/modules/supplier/components/organisms/Modal/ModalForm'
import { ModalDetail } from '@/modules/supplier/components/organisms/Modal/ModalDetail'
import { RestoreModal } from '@/modules/supplier/components/organisms/Modal/ModalRestore'
import { HardDeleteModal } from '@/modules/supplier/components/organisms/Modal/ModalHardDelete'
import { SoftDeleteModal } from '@/modules/supplier/components/organisms/Modal/ModalSoftDelete'

interface ModalsProps {
	modal: {
		type: ModalType
		isOpen: boolean
		record: I_Supplier | null
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
			<ModalDetail
				isOpen={modal.type === 'view' && modal.isOpen}
				currentRecord={modal.record}
				onClose={modal.closeModal}
			/>

			<FormModal
				isOpen={isFormModal && modal.isOpen}
				currentRecord={modal.record}
				onClose={modal.closeModal}
				onSubmit={onSubmit}
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
