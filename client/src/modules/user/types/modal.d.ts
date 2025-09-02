import { I_User } from '@/common/types/modules/user'

export type ModalType = 'create' | 'edit' | 'hardDelete' | 'softDelete' | 'restore'

export interface ModalState {
	type: ModalType | null
	isOpen: boolean
	record: I_User | null
	isLoading: boolean
}
