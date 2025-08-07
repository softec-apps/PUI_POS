'use client'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { I_Supplier } from '@/common/types/modules/supplier'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

interface SupplierlectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	watch: UseFormWatch<ProductFormData>
	supplier: I_Supplier[]
	loadingSupplier: boolean
	supplierSearch: string
	setSupplierSearch: (search: string) => void
	supplierOpen: boolean
	setSupplierOpen: (open: boolean) => void
	loadMoreSupplier: () => void
}

export function Supplierlector({
	control,
	setValue,
	watch,
	supplier,
	loadingSupplier,
	supplierSearch,
	setSupplierSearch,
	supplierOpen,
	setSupplierOpen,
}: SupplierlectorProps) {
	const watchedSupplierId = watch('supplierId')

	const supplierOptions =
		supplier?.data?.items?.map(supplier => ({
			value: supplier.id,
			label: supplier.legalName,
		})) || []

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.truck className='h-4 w-4' />
					Proveedor
				</CardTitle>
				<CardDescription>Organiza tu producto en un proveedor específica</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				{supplier?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay proveedores disponibles'
						message='Por favor, crea un proveedor primero antes de continuar.'
					/>
				) : (
					<>
						<FormField
							control={control}
							name='supplierId'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Selecciona una proveedor</FormLabel>
									<Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant='outline'
													role='combobox'
													className={`w-full justify-between ${!field.value && 'text-muted-foreground'}`}>
													{field.value
														? supplierOptions.find(cat => cat.value === field.value)?.label
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
													<CommandEmpty>
														{loadingSupplier ? 'Buscando...' : 'No se encontraron proveedors'}
													</CommandEmpty>

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
																	className={`mr-2 h-4 w-4 ${supplier.value === field.value ? 'opacity-100' : 'opacity-0'}`}
																/>
																{supplier.label}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/*
						{watchedSupplierId && selectedSupplier && (
							<SelectedSupplierDisplay
								supplier={{
									id: selectedSupplier.id,
									name: selectedSupplier.name,
								}}
								supplierOptions={supplierOptions}
								onRemove={() => setValue('supplierId', '', { shouldValidate: true })}
							/>
						)}
						*/}
					</>
				)}
			</CardContent>
		</Card>
	)
}
