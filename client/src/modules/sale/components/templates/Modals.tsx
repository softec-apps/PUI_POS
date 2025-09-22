'use client'

import { ModalType } from '@/modules/sale/types/modal'
import { I_Sale } from '@/common/types/modules/sale'
import { ModalBillSRI } from '@/modules/sale/components/organisms/modal/ModalBillSRI'

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
			<ModalBillSRI
				isOpen={modal.type === 'view' && modal.isOpen}
				recordData={modal.record}
				onClose={modal.closeModal}
			/>
		</>
	)
}
