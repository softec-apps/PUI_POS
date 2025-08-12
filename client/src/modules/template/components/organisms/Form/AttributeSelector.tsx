import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { TemplateFormData } from '@/modules/template/types/template-form'
import { Icons } from '@/components/icons'
import { SelectedAttributesList } from './SelectedAttributesList'
import { AlertMessage } from '@/components/layout/atoms/Alert'

interface AttributeSelectorProps {
	control: Control<TemplateFormData>
	setValue: UseFormSetValue<TemplateFormData>
	watch: UseFormWatch<TemplateFormData>
	attributes: any
	loadingAttributes: boolean
	attributeSearch: string
	setAttributeSearch: (search: string) => void
	attributeOpen: boolean
	setAttributeOpen: (open: boolean) => void
	selectedAttributes: any[]
	handleAddAttribute: (id: string) => void
}

export function AttributeSelector({
	control,
	setValue,
	watch,
	attributes,
	loadingAttributes,
	attributeSearch,
	setAttributeSearch,
	attributeOpen,
	setAttributeOpen,
	selectedAttributes,
	handleAddAttribute,
}: AttributeSelectorProps) {
	const attributeOptions =
		attributes?.data?.items?.map(attribute => ({
			value: attribute.id,
			label: attribute.name,
		})) || []

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.infoCircle className='h-4 w-4' />
					Atributos
				</CardTitle>
				<CardDescription>Selecciona los atributos que tendrá esta plantilla</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				{attributes?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay atributos disponibles'
						message='Por favor, crea un atributo primero antes de continuar.'
					/>
				) : (
					<>
						<FormField
							control={control}
							name='atributeIds'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Buscar y seleccionar atributos</FormLabel>
									<Popover open={attributeOpen} onOpenChange={setAttributeOpen}>
										<PopoverTrigger asChild>
											<FormControl>
												<Button variant='outline' role='combobox' className='w-full justify-between'>
													Buscar atributos
													<Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
												</Button>
											</FormControl>
										</PopoverTrigger>

										<PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
											<Command shouldFilter={false}>
												<CommandInput
													placeholder='Buscar atributos...'
													value={attributeSearch}
													onValueChange={setAttributeSearch}
												/>
												<CommandList>
													<CommandEmpty>
														{loadingAttributes ? 'Buscando...' : 'No se encontraron atributos'}
													</CommandEmpty>
													<CommandGroup>
														{selectedAttributes.map(attr => (
															<CommandItem
																key={attr.id}
																value={attr.id}
																onSelect={() => {
																	setValue(
																		'atributeIds',
																		field.value.filter(id => id !== attr.id),
																		{ shouldValidate: true }
																	)
																}}>
																<Icons.check className='mr-2 h-4 w-4 opacity-100' />
																{attr.name}
															</CommandItem>
														))}

														{attributeOptions
															.filter(attr => !selectedAttributes.some(selected => selected.id === attr.value))
															.map(attribute => (
																<CommandItem
																	key={attribute.value}
																	value={attribute.value}
																	onSelect={() => handleAddAttribute(attribute.value)}>
																	{attribute.label}
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
						{selectedAttributes.length > 0 && (
							<SelectedAttributesList
								attributes={selectedAttributes}
								onRemoveAll={() => setValue('atributeIds', [], { shouldValidate: true })}
								onRemoveAttribute={(id: string) => {
									setValue(
										'atributeIds',
										watch('atributeIds').filter(attrId => attrId !== id),
										{ shouldValidate: true }
									)
								}}
							/>
						)}
					</>
				)}
			</CardContent>
		</Card>
	)
}
