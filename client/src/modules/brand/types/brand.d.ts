import { I_MetaPagination } from '@/common/types/pagination'

/** Propiedades base de marca */
interface I_BaseBrand {
	name: string
	description?: string | null
}

/** Entidad completa de marca con todos los campos */
export interface I_Brand extends I_BaseBrand {
	id: string
	status: string
	createdAt: string
	updatedAt: string
	deletedAt?: string | null
}

/** DTO para creación de marca */
export interface I_CreateBrand {
	name: string
	description?: string | null

}

/** DTO para actualización de marca */
export interface I_UpdateBrand {
	name: string
	description?: string | null
	status: string
}

/** Tipo para referencia de ID de marca */
export interface I_BrandId {
	id: string
}

/** Respuesta paginada de marcas */
export interface I_BrandsResponse {
	brands: I_Brand[]
	metadata?: I_MetaPagination
}
