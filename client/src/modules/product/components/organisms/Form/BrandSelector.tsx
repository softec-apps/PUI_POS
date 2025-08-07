'use client'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { I_Brand } from '@/common/types/modules/brand'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

interface BrandSelectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	watch: UseFormWatch<ProductFormData>
	brands: I_Brand[]
	loadingBrand: boolean
	brandSearch: string
	setBrandSearch: (search: string) => void
	brandOpen: boolean
	setBrandOpen: (open: boolean) => void
	loadMoreBrands: () => void
}

export function BrandSelector({
	control,
	setValue,
	watch,
	brands,
	loadingBrand,
	brandSearch,
	setBrandSearch,
	brandOpen,
	setBrandOpen,
}: BrandSelectorProps) {
	const watchedBrandsId = watch('brandId')

	const brandsOptions =
		brands?.data?.items?.map(brands => ({
			value: brands.id,
			label: brands.name,
		})) || []

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.brandMedium className='h-4 w-4' />
					Marca
				</CardTitle>
				<CardDescription>Organiza tu prodcuto en una marca específica</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				{brands?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay marcas disponibles'
						message='Por favor, crea una marca primero antes de continuar.'
					/>
				) : (
					<>
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
													{field.value
														? brandsOptions.find(cat => cat.value === field.value)?.label
														: 'Buscar marca...'}
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
													<CommandEmpty>{loadingBrand ? 'Buscando...' : 'No se encontraron marcas'}</CommandEmpty>

													<CommandGroup>
														{brandsOptions.map(brands => (
															<CommandItem
																key={brands.value}
																value={brands.value}
																onSelect={() => {
																	setValue('brandId', brands.value, { shouldValidate: true })
																	setBrandOpen(false)
																}}>
																<Icons.check
																	className={`mr-2 h-4 w-4 ${brands.value === field.value ? 'opacity-100' : 'opacity-0'}`}
																/>
																{brands.label}
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
						{watchedBrandsId && selectedBrands && (
							<SelectedBrandsDisplay
								brands={{
									id: selectedBrands.id,
									name: selectedBrands.name,
								}}
								brandsOptions={brandsOptions}
								onRemove={() => setValue('brandsId', '', { shouldValidate: true })}
							/>
						)}
						*/}
					</>
				)}
			</CardContent>
		</Card>
	)
}
