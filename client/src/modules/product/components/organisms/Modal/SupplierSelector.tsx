'use client'

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
	supplierSearch: string
	setSupplierSearch: (search: string) => void
	supplierOpen: boolean
	setSupplierOpen: (open: boolean) => void
	loadMoreSuppliers: () => void
	value: string
}

export function SupplierSelector({
	control,
	setValue,
	suppliers,
	loadingSuppliers,
	supplierSearch,
	setSupplierSearch,
	supplierOpen,
	setSupplierOpen,
	loadMoreSuppliers,
	value,
}: SupplierSelectorProps) {
	const supplierOptions =
		suppliers?.map(supplier => ({
			value: supplier.id,
			label: supplier.legalName,
		})) || []

	return (
		<FormField
			control={control}
			name='supplierId'
			render={({ field }) => (
				<FormItem>
					<FormLabel>Selecciona un proveedor</FormLabel>
					<Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant='outline'
									role='combobox'
									className={`w-full justify-between ${!value && 'text-muted-foreground'}`}>
									{value
										? supplierOptions.find(supplier => supplier.value === value)?.label
										: 'Buscar proveedor...'}
									<Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</FormControl>
						</PopoverTrigger>

						<PopoverContent className='min-w-full p-0' align='start'>
							<Command shouldFilter={false}>
								<CommandInput
									placeholder='Buscar proveedor...'
									value={supplierSearch}
									onValueChange={setSupplierSearch}
								/>
								<CommandList>
									<CommandEmpty>{loadingSuppliers ? 'Buscando...' : 'No se encontraron proveedores'}</CommandEmpty>

									<CommandGroup>
										{supplierOptions.map(supplier => (
											<CommandItem
												key={supplier.value}
												value={supplier.value}
												onSelect={() => {
													setValue('supplierId', supplier.value, { shouldValidate: true })
													setSupplierOpen(false)
												}}>
												<Icons.check
													className={`mr-2 h-4 w-4 ${supplier.value === value ? 'opacity-100' : 'opacity-0'}`}
												/>
												{supplier.label}
											</CommandItem>
										))}
										{suppliers?.data?.hasNextPage && (
											<CommandItem onSelect={loadMoreSuppliers}>
												<Icons.plus className='mr-2 h-4 w-4' />
												Cargar más proveedores...
											</CommandItem>
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
