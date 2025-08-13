'use client'

import { z } from 'zod'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'

import { Icons } from '@/components/icons'
import { I_Sale } from '@/common/types/modules/sale'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'

// Schema de validación
const saleSchema = z.object({
	customerId: z.string().min(1, 'El cliente es requerido'),
    sellerId: z.string().min(1, 'El vendedor es requerido'),
	items: z.array(z.object({
        productId: z.string().min(1, 'El producto es requerido'),
        quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
        price: z.number().min(0, 'El precio no puede ser negativo'),
    })).min(1, 'Debe haber al menos un item en la venta'),
    total: z.number().min(0, 'El total no puede ser negativo'),
    status: z.enum(['completed', 'pending', 'cancelled']),
})

export type SaleFormData = z.infer<typeof saleSchema>

interface Props {
	isOpen: boolean
	currentSale: I_Sale | null
	onClose: () => void
	onSubmit: (data: SaleFormData) => Promise<void>
}

export function SaleFormModal({
	isOpen,
	currentSale,
	onClose,
	onSubmit,
}: Props) {
	const methods = useForm<SaleFormData>({
		resolver: zodResolver(saleSchema),
		mode: 'onChange',
		defaultValues: {
			status: 'pending',
		},
	})

	const {
		handleSubmit,
		reset,
		control,
		formState: { errors, isValid, isDirty },
	} = methods

	React.useEffect(() => {
		if (isOpen && currentSale) {
			reset({
                ...currentSale,
                customerId: currentSale.customer.id,
                sellerId: currentSale.seller.id,
                items: currentSale.items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.price,
                }))
            })
		} else if (isOpen && !currentSale) {
			reset({
                items: [],
                status: 'pending',
            })
		}
	}, [isOpen, currentSale, reset])

	const handleFormSubmit = async (data: SaleFormData) => {
		try {
			await onSubmit(data)
			reset()
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClose = () => {
		reset()
		onClose()
	}

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='flex w-full flex-col sm:max-w-xl'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentSale ? 'Editar Venta' : 'Crear Venta'}</SheetTitle>
						<SheetClose>
							<ActionButton
								type='button'
								variant='ghost'
								size='icon'
								disabled={onSubmit}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</SheetClose>
					</div>
					<SheetDescription>
						{currentSale
							? 'Modifica los detalles de la venta existente'
							: 'Completa los campos para crear una nueva venta'}
					</SheetDescription>
				</SheetHeader>

				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(handleFormSubmit)} className='flex-1 space-y-4 overflow-auto p-4'>
						<Card className='border-none bg-transparent p-0 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.infoCircle className='h-4 w-4' />
									Información básica
								</CardTitle>
								<CardDescription>Datos básicos de la venta</CardDescription>
							</CardHeader>

							<UniversalFormField
								control={control}
								name='customerId'
								label='Cliente'
								placeholder='Selecciona un cliente'
								type='text' // This should be a select/combobox
								required={true}
								showValidationIcons={true}
							/>

                            <UniversalFormField
								control={control}
								name='sellerId'
								label='Vendedor'
								placeholder='Selecciona un vendedor'
								type='text' // This should be a select/combobox
								required={true}
								showValidationIcons={true}
							/>
						</Card>

                        {/* Items section will be more complex, this is a placeholder */}
                        <Card className='border-none bg-transparent p-0 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.packageIcon className='h-4 w-4' />
									Items
								</CardTitle>
								<CardDescription>Añade productos a la venta</CardDescription>
							</CardHeader>
						</Card>

                        <div className='flex justify-end gap-4'>
                            <ActionButton
                                type='button'
                                variant='outline'
                                onClick={handleClose}
                                text='Cancelar'
                            />
                            <ActionButton
                                type='submit'
                                disabled={!isValid || !isDirty}
                                text={currentSale ? 'Guardar Cambios' : 'Crear Venta'}
                            />
                        </div>
					</form>
				</FormProvider>
			</SheetContent>
		</Sheet>
	)
}
