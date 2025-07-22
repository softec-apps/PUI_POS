import { I_MetaPagination } from '@/common/types/pagination'

/** Estructura base para la foto de categoría */
interface I_CategoryPhoto {
	id: string
	path: string
}

/** Foto opcional para creación/actualización */
interface I_OptionalCategoryPhoto {
	id?: string
	path?: string
}

/** Foto nullable para actualizaciones */
interface I_NullableCategoryPhoto {
	id?: string | null
	path?: string | null
}

/** Propiedades base de categoría */
interface I_BaseCategory {
	name: string
	description?: string | null
	photo?: I_CategoryPhoto | null
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
	photo?: I_OptionalCategoryPhoto | null
}

/** DTO para actualización de categoría */
export interface I_UpdateCategory {
	name: string
	description?: string | null
	photo?: I_NullableCategoryPhoto | null
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
