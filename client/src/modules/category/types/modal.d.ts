import { I_Category } from '@/common/types/modules/category'

export type ModalType = 'create' | 'edit' | 'hardDelete' | 'softDelete' | 'restore'

export interface ModalState {
	type: ModalType | null
	isOpen: boolean
	record: I_Category | null
	isLoading: boolean
}
