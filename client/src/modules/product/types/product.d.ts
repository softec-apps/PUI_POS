import { I_Brand } from '@/modules/brand/types/brand'
import { I_Category } from '@/modules/category/types/category'
import { I_Supplier } from '@/modules/supplier/types/supplier'
import { I_Template } from '@/modules/template/types/template'
import { MetaDataPagination, MetaResponse } from '@/common/types/pagination'

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'discontinued' | 'out_of_stock'

interface I_Photo {
	id: string
	path: string
}

export interface I_Product {
	id: string
	code: string
	isVariant: boolean
	name: string
	description: string | null
	status: ProductStatus
	photo?: I_Photo
	price: number
	sku: string | null
	barCode: string | null
	stock: number
	category: I_Category | null
	brand: I_Brand | null
	suppplier: I_Supplier | null
	template: I_Template | null
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export interface I_CreateProduct {
	isVariant?: boolean
	name: string
	description?: string | null
	status?: ProductStatus
	photo?: I_Photo
	price: number
	sku?: string | null
	barCode?: string | null
	stock?: number
	categoryId?: string | null
	brandId?: string | null
	supplierId?: string | null
	templateId?: string | null
}

export interface I_UpdateProduct {
	isVariant?: boolean
	name?: string
	description?: string | null
	status?: ProductStatus
	photo?: I_Photo
	price?: number
	sku?: string | null
	barCode?: string | null
	stock?: number
	categoryId?: string | null
	brandId?: string | null
	supplierId?: string | null
	templateId?: string | null
}

export interface I_IdProduct {
	id: string
}

export interface I_ProductResponse {
	success: boolean
	statusCode: number
	message: string
	data: {
		items: I_Product[]
		pagination: MetaDataPagination
	}
	meta: MetaResponse
}
