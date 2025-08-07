import { I_Photo } from '@/common/types/photo'
import { I_MetaPagination } from '@/common/types/pagination'

/** Propiedades base de categoría */
interface I_BaseCategory {
	name: string
	description?: string | null
	photo?: I_Photo | null
}

/** Entidad completa de categoría con todos los campos */
export interface I_Category extends I_BaseCategory {
	id: string
	status: string
	createdAt: string
	updatedAt: string
	deletedAt?: string | null
}

/** DTO para creación de categoría */
export interface I_CreateCategory {
	name: string
	description?: string | null
	photo?: I_Photo | null
}

/** DTO para actualización de categoría */
export interface I_UpdateCategory {
	name: string
	description?: string | null
	photo?: I_Photo | null
	status: string
}

/** Tipo para referencia de ID de categoría */
export interface I_CategoryId {
	id: string
}

/** Respuesta paginada de categorías */
export interface I_CategoriesResponse {
	categories: I_Category[]
	metadata?: I_MetaPagination
}
