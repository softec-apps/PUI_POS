import { z } from 'zod'
import { I_Supplier } from '@/common/types/modules/supplier'
import { validateEcuadorianRUC } from '@/common/utils/ecValidation-util'

const BaseSupplierSchema = z.object({
	legalName: z.string().max(300, 'Límite de 300 caracteres excedido').nonempty('No puede estar vacío'),
	ruc: z
		.string()
		.nonempty('No puede estar vacío')
		.refine(value => /^\d*$/.test(value), {
			message: 'Formato invalido',
		})
		.refine(value => value.length === 13, {
			message: 'Debe tener exactamente 13 caracteres',
		})
		.refine(
			value => {
				// Solo validar algoritmo si ya tiene 13 dígitos y son solo números
				if (value.length === 13 && /^\d{13}$/.test(value)) {
					try {
						return validateEcuadorianRUC(value)
					} catch (error) {
						console.log('Error validando RUC:', error)
						return false
					}
				}
				// Si no tiene 13 dígitos, no ejecutar esta validación
				return true
			},
			{
				message: 'RUC ingresado no es válido',
			}
		),
	commercialName: z.string().max(300, 'Límite de 300 caracteres excedido').optional(),
})

// Schema extendido para creación/edición
export const supplierSchema = (isEditing: boolean) => {
	return BaseSupplierSchema.extend({
		status: isEditing ? z.string().nonempty('Selecciona un estado') : z.string().optional().default('active'),
	})
}

export type SupplierFormData = z.infer<ReturnType<typeof supplierSchema>>

export interface SupplierFormProps {
	isOpen: boolean
	currentRecord?: I_Supplier
	onClose: () => void
	onSubmit: (data: SupplierFormData) => Promise<void>
}
