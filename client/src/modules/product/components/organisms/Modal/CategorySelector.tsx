'use client'

import { useState } from 'react'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { I_Category } from '@/modules/category/types/category'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/components/organisms/Modal/ModalForm'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

interface CategorySelectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	categories: I_Category[]
	loadingCategories: boolean
	value: string
}

export function CategorySelector({ control, setValue, value, categories, loadingCategories }: CategorySelectorProps) {
	const [open, setOpen] = useState(false)
	const categoryOptions =
		categories?.map(category => ({
			value: category,
			label: category.name,
		})) || []

	return (
		<FormField
			control={control}
			name='categoryId'
			render={({ field }) => (
				<FormItem>
					<FormLabel>Selecciona una categoría</FormLabel>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant='outline'
									role='combobox'
									className={`w-full justify-between ${!field.value && 'text-muted-foreground'}`}>
									{field.value
										? categoryOptions.find(cat => cat.value.id === field.value.id)?.label
										: 'Buscar categoría...'}
									<Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
								</Button>
							</FormControl>
						</PopoverTrigger>

						<PopoverContent className='min-w-full p-0' align='start'>
							<Command>
								<CommandInput placeholder='Buscar categoría...' />
								<CommandList>
									<CommandEmpty>No se encontraron categorías</CommandEmpty>
									<CommandGroup>
										{loadingCategories ? (
											<div className='flex items-center justify-center p-2'>
												<SpinnerLoader />
											</div>
										) : (
											categoryOptions.map(category => (
												<CommandItem
													key={category.value.id}
													value={category.label}
													onSelect={() => {
														setValue('categoryId', category.value, { shouldValidate: true })
														setOpen(false)
													}}>
													<Icons.check
														className={`mr-2 h-4 w-4 ${
															category.value.id === field.value?.id ? 'opacity-100' : 'opacity-0'
														}`}
													/>
													{category.label}
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
