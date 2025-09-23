'use client'

import { ModalType } from '@/modules/sale/types/modal'
import { I_Sale } from '@/common/types/modules/sale'
import { ModalViewBillSRI } from '@/modules/sale/components/organisms/modal/ModalViewBillSRI'
import { ModalViewVoucher } from '@/modules/sale/components/organisms/modal/ModalViewVoucher'

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
			<ModalViewBillSRI
				isOpen={modal.type === 'viewBillSRI' && modal.isOpen}
				recordData={modal.record}
				onClose={modal.closeModal}
			/>

			<ModalViewVoucher
				isOpen={modal.type === 'viewVoucher' && modal.isOpen}
				recordData={modal.record}
				onClose={modal.closeModal}
			/>
		</>
	)
}
