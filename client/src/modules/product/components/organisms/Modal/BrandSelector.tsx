'use client'

import { I_Brand } from '@/modules/brand/types/brand'
import { ProductFormData } from '@/modules/product/components/organisms/Modal/ModalForm'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Control, UseFormSetValue } from 'react-hook-form'

interface BrandSelectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	brands: I_Brand[]
	loadingBrands: boolean
	brandSearch: string
	setBrandSearch: (search: string) => void
	brandOpen: boolean
	setBrandOpen: (open: boolean) => void
	loadMoreBrands: () => void
}

export function BrandSelector({
	control,
	setValue,
	brands,
	loadingBrands,
	brandSearch,
	setBrandSearch,
	brandOpen,
	setBrandOpen,
	loadMoreBrands,
}: BrandSelectorProps) {
	const brandOptions =
		brands?.data?.items?.map(brand => ({
			value: brand.id,
			label: brand.name,
		})) || []

	return (
		<FormField
			control={control}
			name='brandId'
			render={({ field }) => (
				<FormItem>
					<FormLabel>Selecciona una marca</FormLabel>
					<Popover open={brandOpen} onOpenChange={setBrandOpen}>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant='outline'
									role='combobox'
									className={`w-full justify-between ${!field.value && 'text-muted-foreground'}`}>
									{field.value ? brandOptions.find(brand => brand.value === field.value)?.label : 'Buscar marca...'}
									<Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</FormControl>
						</PopoverTrigger>

						<PopoverContent className='min-w-full p-0' align='start'>
							<Command shouldFilter={false}>
								<CommandInput
									placeholder='Buscar marca...'
									value={brandSearch}
									onValueChange={setBrandSearch}
								/>
								<CommandList>
									<CommandEmpty>{loadingBrands ? 'Buscando...' : 'No se encontraron marcas'}</CommandEmpty>

									<CommandGroup>
										{brandOptions.map(brand => (
											<CommandItem
												key={brand.value}
												value={brand.value}
												onSelect={() => {
													setValue('brandId', brand.value, { shouldValidate: true })
													setBrandOpen(false)
												}}>
												<Icons.check
													className={`mr-2 h-4 w-4 ${brand.value === field.value ? 'opacity-100' : 'opacity-0'}`}
												/>
												{brand.label}
											</CommandItem>
										))}
										{brands?.data?.hasNextPage && (
											<CommandItem onSelect={loadMoreBrands}>
												<Icons.plus className='mr-2 h-4 w-4' />
												Cargar más marcas...
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
