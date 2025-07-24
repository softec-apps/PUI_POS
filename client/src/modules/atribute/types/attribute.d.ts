import { AttributeTypeAllow } from '@/modules/atribute/enums/attribute-types-allow.enum'

/** Propiedades base del atributo */
interface I_BaseAttribute {
	name: string
	type: AttributeTypeAllow
}

/** Entidad completa de atributo con todos los campos */
export interface I_Attribute extends I_BaseAttribute {
	id: string
	options?: string[] | null
	required: boolean
	createdAt: Date
	updatedAt: Date
}

/** DTO para creación del atributo */
export interface I_CreateAttribute {
	name: string
	type: AttributeTypeAllow
	options?: string[] | null
	required: boolean
}

/** DTO para actualización del atributo */
export interface I_UpdateAttribute extends I_BaseAttribute {
	options?: string[] | null
	required: boolean
}

/** Tipo para referencia de ID del atributo */
export interface I_AttributeId {
	id: string
}

/** Respuesta paginada del atributos */
export interface I_AttributesResponse {
	items: I_Attribute[]
	pagination?: {
		totalRecords: number
		currentPage: number
		totalPages: number
		pageSize: number
		hasNextPage: boolean
		hasPreviousPage: boolean
		firstPage: number
		lastPage: number
	}
	
}

