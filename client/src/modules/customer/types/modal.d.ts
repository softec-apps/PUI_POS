import { I_Customer } from '@/common/types/modules/customer'

export type ModalType = 'create' | 'edit' | 'hardDelete' | 'softDelete' | 'restore'

export interface ModalState {
	type: ModalType | null
	isOpen: boolean
	record: I_Customer | null
	isLoading: boolean
}
