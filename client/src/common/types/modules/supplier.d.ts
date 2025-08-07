import { I_MetaPagination } from '@/common/types/pagination'

export interface I_Supplier {
	id: string
	ruc: string
	legalName: string
	commercialName: string
	status: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export interface I_CreateSupplier {
	ruc: string
	legalName: string
	commercialName?: string | null
	status: string
}

export interface I_UpdateSupplier {
	ruc?: string
	legalName?: string
	commercialName?: string
	status?: string
}

export interface I_IdSupplier {
	id: string
}

export interface I_SupplierResponse {
	items: I_Supplier[]
	pagination: I_MetaPagination
}
