import { I_User } from '@/common/types/modules/user'
import { I_Product } from '@/common/types/modules/product'
import { MetaDataPagination, MetaResponse } from '@/common/types/pagination'

/** Propiedades base del Kardex */
interface I_BaseKardex {
	product: I_Product
	user: I_User
	movementType:
		| 'purchase'
		| 'return_in'
		| 'transfer_in'
		| 'sale'
		| 'return_out'
		| 'transfer_out'
		| 'adjustment_in'
		| 'adjustment_out'
		| 'damaged'
		| 'expired'
	quantity: number
	unitCost: number
	subtotal: number
	taxRate: number
	taxAmount: number
	total: number
	stockBefore: number
	stockAfter: number
	reason: string
}

/** Entidad completa del Kardex con todos los campos */
export interface I_Kardex extends I_BaseKardex {
	id: string
	createdAt: string | Date
	updatedAt: string | Date
}

/** Tipo para referencia de ID */
export interface I_KardexId {
	id: string
}

/** Respuesta paginada de movimientos tipo Kardex */
export interface I_KardexResponse {
	success: boolean
	statusCode: number
	message: string
	data: {
		items: I_Kardex[]
		pagination: MetaDataPagination
	}
	meta: MetaResponse
}
