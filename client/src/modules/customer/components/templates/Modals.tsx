/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { I_Customer } from '@/common/types/modules/customer'
import { FormModal } from '@/modules/customer/components/organisms/Modal/ModalForm'
import { HardDeleteModal } from '@/modules/customer/components/organisms/Modal/ModalHardDelete'

interface ModalsProps {
	modal: {
		type: 'create' | 'edit' | 'hardDelete' | 'softDelete' | 'restore' | null
		isOpen: boolean
		record: I_Customer | null
		isLoading: boolean
		closeModal: () => void
	}
	onSubmit: (data: any) => Promise<void>
	onDelete: () => Promise<void>
}

export function Modals({ modal, onSubmit, onDelete }: ModalsProps) {
	const isFormModal = modal.type === 'create' || modal.type === 'edit'

	return (
		<>
			<FormModal
				isOpen={isFormModal && modal.isOpen}
				currentRecord={modal.record}
				onClose={modal.closeModal}
				onSubmit={onSubmit}
				isLoading={modal.isLoading}
			/>

			<HardDeleteModal
				isOpen={modal.type === 'hardDelete' && modal.isOpen}
				currentRecord={modal.record}
				isAction={modal.isLoading}
				onClose={modal.closeModal}
				onConfirm={onDelete}
			/>
		</>
	)
}
