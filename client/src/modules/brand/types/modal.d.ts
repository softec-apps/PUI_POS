import { I_Brand } from '@/common/types/modules/brand'

export type ModalType = 'create' | 'edit' | 'hardDelete' | 'softDelete' | 'restore'

export interface ModalState {
	type: ModalType | null
	isOpen: boolean
	record: I_Brand | null
	isLoading: boolean
}
