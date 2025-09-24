'use client'

import { ModalType } from '@/modules/sale/types/modal'
import { I_Sale } from '@/common/types/modules/sale'
import { ModalViewBill } from '@/modules/sale/components/organisms/modal/ModalViewBill'

interface ModalsProps {
	modal: {
		type: ModalType
		isOpen: boolean
		record: I_Sale | null
		isLoading: boolean
		closeModal: () => void
	}
}

export function Modals({ modal }: ModalsProps) {
	return (
		<>
			<ModalViewBill
				isOpen={modal.type === 'view' && modal.isOpen}
				recordData={modal.record}
				onClose={modal.closeModal}
			/>
		</>
	)
}
