import { I_Photo } from '@/common/types/photo'
import { MetaDataPagination, MetaResponse } from '@/common/types/pagination'

/** Rol asignado al usuario */
export interface I_Role {
	id: number
	name: string
}

/** Estado actual del usuario */
export interface I_Status {
	id: number
	name: string
}

/** Propiedades base comunes a creación, edición y visualización */
export interface I_BaseUser {
	email: string
	dni: string
	identificationCard: string
	firstName: string
	lastName: string

	provider?: string | null
	socialId?: string | null
}

/** Representación completa del usuario */
export interface I_User extends I_BaseUser {
	id: string
	photo: I_Photo
	role: I_Role
	status: I_Status
	createdAt: string | Date
	updatedAt: string | Date
	deletedAt?: string | Date | null
}

/** DTO para crear un nuevo usuario */
export interface I_CreateUser extends I_BaseUser {}

/** DTO para actualizar un usuario existente */
export interface I_UpdateUser extends Partial<I_BaseUser> {
	id?: string // Opcional si se envía por parámetro externo
	roleId?: number
	statusId?: number
	photoId?: string
}

/** Para uso cuando solo se requiere una referencia por ID */
export interface I_UserId {
	id: string
}

/** Respuesta paginada con metadatos */
export interface I_UserResponse {
	success: boolean
	statusCode: number
	message: string
	data: {
		items: I_User[]
		pagination: MetaDataPagination
	}
	meta: MetaResponse
}
