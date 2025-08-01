'use client'

import { useState } from 'react'
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
	value: string
}

export function BrandSelector({ control, setValue, value, brands, loadingBrands }: BrandSelectorProps) {
	const [open, setOpen] = useState(false)
	const brandOptions =
		brands?.map(brand => ({
			value: brand,
			label: brand.name,
		})) || []

	return (
		<FormField
			control={control}
			name='brandId'
			render={({ field }) => (
				<FormItem>
					<FormLabel>Selecciona una marca</FormLabel>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant='outline'
									role='combobox'
									className={`w-full justify-between ${!field.value && 'text-muted-foreground'}`}>
									{field.value
										? brandOptions.find(brand => brand.value.id === field.value.id)?.label
										: 'Buscar marca...'}
									<Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</FormControl>
						</PopoverTrigger>

						<PopoverContent className='min-w-full p-0' align='start'>
							<Command>
								<CommandInput placeholder='Buscar marca...' />
								<CommandList>
									<CommandEmpty>No se encontraron marcas</CommandEmpty>
									<CommandGroup>
										{loadingBrands ? (
											<div className='flex items-center justify-center p-2'>
												<SpinnerLoader />
											</div>
										) : (
											brandOptions.map(brand => (
												<CommandItem
													key={brand.value.id}
													value={brand.label}
													onSelect={() => {
														setValue('brandId', brand.value, { shouldValidate: true })
														setOpen(false)
													}}>
													<Icons.check
														className={`mr-2 h-4 w-4 ${
															brand.value.id === field.value?.id ? 'opacity-100' : 'opacity-0'
														}`}
													/>
													{brand.label}
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
