import { z } from 'zod'
import { I_Customer } from '@/common/types/modules/customer'
import { CustomerType, IdentificationType } from '@/common/enums/customer.enum'
import { validateCedula, validateEcuadorianRUC } from '@/common/utils/ecValidation-util'

const BaseCustomerSchema = z
	.object({
		firstName: z.string().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
		lastName: z.string().min(1, 'El apellido es requerido').max(255, 'Máximo 255 caracteres'),
		email: z.string().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
		phone: z.string().min(10, 'Mínimo 10 caracteres').max(10, 'Máximo 10 caracteres').optional().or(z.literal('')),
		address: z.string().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
		identificationType: z.enum(
			[
				IdentificationType.FINAL_CONSUMER, // 07
				IdentificationType.IDENTIFICATION_CARD, // 05
				IdentificationType.PASSPORT, // 06
				IdentificationType.RUC, // 04
			] as const,
			{
				errorMap: () => ({ message: 'Selecciona un tipo de identificación válido' }),
			}
		),
		identificationNumber: z.string().min(1, 'Campo requerido').max(13, 'Máximo 13 caracteres'),
		customerType: z.enum([CustomerType.REGULAR, CustomerType.FINAL_CONSUMER] as const).default(CustomerType.REGULAR),
	})
	.superRefine((data, ctx) => {
		// Validaciones para consumidor final
		if (data.customerType === CustomerType.FINAL_CONSUMER) {
			if (data.identificationType !== IdentificationType.FINAL_CONSUMER) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['identificationType'],
					message: `Para consumidor final debe ser tipo ${IdentificationType.FINAL_CONSUMER}`,
				})
			}
			if (data.identificationNumber !== '9999999999999') {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['identificationNumber'],
					message: 'Para consumidor final debe ser 9999999999999',
				})
			}

			// Para consumidor final NO validar email - es completamente opcional
			// Solo validar formato si el usuario escribió algo
			if (data.email && data.email.trim() !== '' && data.email !== '') {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
				if (!emailRegex.test(data.email)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['email'],
						message: 'Email inválido',
					})
				}
			}

			// Terminar aquí - no validar más campos para consumidor final
			return
		}

		// Validaciones para cliente regular
		if (data.customerType === CustomerType.REGULAR) {
			// Email es requerido para clientes regulares
			if (!data.email || data.email.trim() === '') {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['email'],
					message: 'Campo requerido para clientes regulares',
				})
			} else {
				// Validar formato de email si no está vacío
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
				if (!emailRegex.test(data.email)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['email'],
						message: 'Email inválido',
					})
				}
			}
		}

		// Validar número de identificación según el tipo
		const id = data.identificationNumber?.trim()
		if (!id) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['identificationNumber'],
				message: 'Número de identificación requerido',
			})
			return
		}

		switch (data.identificationType) {
			case IdentificationType.IDENTIFICATION_CARD: // 05 - Cédula
				if (!validateCedula(id)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['identificationNumber'],
						message: 'Cédula inválida',
					})
				}
				break

			case IdentificationType.RUC: // 04 - RUC
				if (!validateEcuadorianRUC(id)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['identificationNumber'],
						message: 'RUC inválido',
					})
				}
				break

			case IdentificationType.PASSPORT: // 06 - Pasaporte
				if (id.length < 3) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['identificationNumber'],
						message: 'Pasaporte inválido (mínimo 3 caracteres)',
					})
				}
				break

			case IdentificationType.FINAL_CONSUMER: // 07 - Consumidor Final
				if (id !== '9999999999999') {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ['identificationNumber'],
						message: 'Para consumidor final debe ser 9999999999999',
					})
				}
				break

			default:
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['identificationType'],
					message: 'Tipo de identificación no válido',
				})
		}

		// Validar teléfono ecuatoriano si está presente
		if (data.phone && data.phone.trim() !== '') {
			const phoneRegex = /^0[2-9]\d{8}$/
			if (!phoneRegex.test(data.phone)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['phone'],
					message: 'Formato de teléfono inválido (ej: 0987654321)',
				})
			}
		}
	})

// Schema extendido para creación/edición
export const customerSchema = (isEditing: boolean) => {
	// No hay campos adicionales para edición en este caso
	// Solo devolvemos el schema base
	return BaseCustomerSchema
}

export type CustomerFormData = z.infer<ReturnType<typeof customerSchema>>

export interface CustomerFormProps {
	isOpen: boolean
	currentRecord?: I_Customer
	onClose: () => void
	onSubmit: (data: CustomerFormData) => Promise<void>
}
