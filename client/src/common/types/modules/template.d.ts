import { I_Category } from '@/common/types/modules/category'
import { I_Attribute } from '@/common/types/modules/attribute'
import { MetaDataPagination, MetaResponse } from '@/common/types/pagination'

/** Propiedades base */
interface I_BaseTemplate {
	name?: string
	description?: string | null
}

/** Entidad completa con todos los campos */
export interface I_Template extends I_BaseTemplate {
	id: string
	category?: I_Category
	atributes?: I_Attribute[]
	createdAt: string
	updatedAt: string
	deletedAt?: string | null
}

/** DTO para creación */
export interface I_CreateTemplate extends I_BaseTemplate {
	categoryId: string
	atributeIds: string[]
}

/** DTO para actualización */
export interface I_UpdateTemplate extends I_BaseTemplate {
	categoryId: string
	atributeIds: string[]
}

/** Tipo para referencia de ID */
export interface I_TemplateId {
	id: string
}

/** Respuesta paginada */
export interface I_TemplateResponse {
	success: boolean
	statusCode: number
	message: string
	data: {
		items: I_Template[]
		pagination: MetaDataPagination
	}
	meta: MetaResponse
}
