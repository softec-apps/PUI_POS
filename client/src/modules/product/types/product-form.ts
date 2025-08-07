import { z } from 'zod'
import { I_Product } from '@/common/types/modules/product'
import { STATUS_ALLOW } from '@/modules/product/constants/product.constants'

export const ProductSchema = z.object({
	name: z.string().nonempty('Campo requerido').min(5, 'Mínimo 5 caracteres').max(255, 'Máximo 255 caracteres'),
	description: z.string().optional().or(z.literal('')),
	price: z.preprocess(
		val => {
			if (val === '' || val === null || val === undefined) return undefined
			if (typeof val === 'string') {
				// Si es string, verificar que sea un número válido
				if (!/^-?\d*\.?\d*$/.test(val)) return NaN // Esto forzará el error de validación
				return Number(val)
			}
			return val
		},
		z
			.number({ required_error: 'Campo requerido' })
			.positive('Debe ser un número positivo')
			.max(999999.999999, 'Máximo 6 dígitos y 6 decimales')
			.refine(val => /^\d{1,6}(\.\d{1,6})?$/.test(val.toString()), {
				message: 'Máximo 6 enteros y 6 decimales',
			})
	),
	stock: z.preprocess(
		val => {
			if (val === '' || val === null || val === undefined) return 0
			if (typeof val === 'string') {
				// Si es string, verificar que sea un número entero válido
				if (!/^-?\d*$/.test(val)) return NaN // Esto forzará el error de validación
				return Number(val)
			}
			return val
		},
		z.number({ required_error: 'Campo requerido' }).int('Debe ser un entero').min(1, 'Debe ser un número positivo')
	),
	sku: z.string().max(20, 'Máximo 20 caracteres').optional(),
	barCode: z.string().max(50, 'Máximo 50 caracteres').optional(),
	status: z.enum([
		STATUS_ALLOW.DRAFT,
		STATUS_ALLOW.ACTIVE,
		STATUS_ALLOW.INACTIVE,
		STATUS_ALLOW.DISCONTINUED,
		STATUS_ALLOW.OUT_OF_STOCK,
	]),
	photo: z.string().optional(),
	//removePhoto: z.boolean().optional(),
	categoryId: z.string().uuid('Selecciona una categoría válida'),
	brandId: z.string().uuid('Selecciona una marca válida'),
	supplierId: z.string().uuid('Selecciona un proveedor válida'),
	templateId: z.string().uuid('Selecciona una plantilla válida'),
})

export type ProductFormData = z.infer<typeof ProductSchema>

export interface ProductFormProps {
	isOpen: boolean
	currentRecord?: I_Product
	onClose: () => void
	onSubmit: (data: ProductFormData) => Promise<void>
}
