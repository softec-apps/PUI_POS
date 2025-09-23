import { I_Sale } from '@/common/types/modules/sale'

export type ModalType = 'viewBillSRI' | 'viewVoucher'

export interface ModalState {
	type: ModalType | null
	isOpen: boolean
	record: I_Sale | null
	isLoading: boolean
}
