'use client'

import { useState } from 'react'
import { I_Supplier } from '@/modules/supplier/types/supplier'
import { ProductFormData } from '@/modules/product/components/organisms/Modal/ModalForm'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Control, UseFormSetValue } from 'react-hook-form'

interface SupplierSelectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	suppliers: I_Supplier[]
	loadingSuppliers: boolean
	value: string
}

export function SupplierSelector({ control, setValue, value, suppliers, loadingSuppliers }: SupplierSelectorProps) {
	const [open, setOpen] = useState(false)
	const supplierOptions =
		suppliers?.map(supplier => ({
			value: supplier,
			label: supplier.legalName,
		})) || []

	return (
		<FormField
			control={control}
			name='supplierId'
			render={({ field }) => (
				<FormItem>
					<FormLabel>Selecciona un proveedor</FormLabel>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant='outline'
									role='combobox'
									className={`w-full justify-between ${!field.value && 'text-muted-foreground'}`}>
									{field.value
										? supplierOptions.find(supplier => supplier.value.id === field.value.id)?.label
										: 'Buscar proveedor...'}
									<Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</FormControl>
						</PopoverTrigger>

						<PopoverContent className='min-w-full p-0' align='start'>
							<Command>
								<CommandInput placeholder='Buscar proveedor...' />
								<CommandList>
									<CommandEmpty>No se encontraron proveedores</CommandEmpty>
									<CommandGroup>
										{loadingSuppliers ? (
											<div className='flex items-center justify-center p-2'>
												<SpinnerLoader />
											</div>
										) : (
											supplierOptions.map(supplier => (
												<CommandItem
													key={supplier.value.id}
													value={supplier.label}
													onSelect={() => {
														setValue('supplierId', supplier.value, { shouldValidate: true })
														setOpen(false)
													}}>
													<Icons.check
														className={`mr-2 h-4 w-4 ${
															supplier.value.id === field.value?.id ? 'opacity-100' : 'opacity-0'
														}`}
													/>
													{supplier.label}
												</CommandItem>
											))
										)}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
