import { I_Supplier } from '@/common/types/modules/supplier'

export type ModalType = 'create' | 'edit' | 'view' | 'hardDelete' | 'softDelete' | 'restore'

export interface ModalState {
	type: ModalType | null
	isOpen: boolean
	record: I_Supplier | null
	isLoading: boolean
}
