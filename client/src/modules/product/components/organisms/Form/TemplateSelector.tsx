'use client'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { I_Template } from '@/common/types/modules/template'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { ProductFormData } from '@/modules/product/types/product-form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

interface TemplateSelectorProps {
	control: Control<ProductFormData>
	setValue: UseFormSetValue<ProductFormData>
	watch: UseFormWatch<ProductFormData>
	templates: I_Template[]
	loadingTemplates: boolean
	templateSearch: string
	setTemplateSearch: (search: string) => void
	templateOpen: boolean
	setTemplateOpen: (open: boolean) => void
	loadMoreTemplates: () => void
}

export function TemplateSelector({
	control,
	setValue,
	watch,
	templates,
	loadingTemplates,
	templateSearch,
	setTemplateSearch,
	templateOpen,
	setTemplateOpen,
}: TemplateSelectorProps) {
	const watchedTemplateId = watch('templateId')

	const templateOptions =
		templates?.data?.items?.map(template => ({
			value: template.id,
			label: template.name,
		})) || []

	// Encontrar la plantilla seleccionada
	const selectedTemplate = templates?.data?.items?.find(c => c.id === watchedTemplateId)

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.boxModel2 className='h-4 w-4' />
					Plantilla
				</CardTitle>
				<CardDescription>Organiza tu producto en una plantilla específica</CardDescription>
			</CardHeader>

			<CardContent className='space-y-4 p-0'>
				{templates?.data?.pagination?.totalRecords === 0 ? (
					<AlertMessage
						variant='warning'
						title='No hay plantillas disponibles'
						message='Por favor, crea una plantilla primero antes de continuar.'
					/>
				) : (
					<>
						<FormField
							control={control}
							name='templateId'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Selecciona una plantilla</FormLabel>
									<Popover open={templateOpen} onOpenChange={setTemplateOpen}>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant='outline'
													role='combobox'
													className={`w-full justify-between ${!field.value && 'text-muted-foreground'}`}>
													{field.value
														? templateOptions.find(plant => plant.value === field.value)?.label
														: 'Buscar plantilla...'}
													<Icons.chevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
												</Button>
											</FormControl>
										</PopoverTrigger>

										<PopoverContent className='min-w-full p-0' align='start'>
											<Command shouldFilter={false}>
												<CommandInput
													placeholder='Buscar plantilla...'
													value={templateSearch}
													onValueChange={setTemplateSearch}
												/>
												<CommandList>
													<CommandEmpty>
														{loadingTemplates ? 'Buscando...' : 'No se encontraron plantillas'}
													</CommandEmpty>

													<CommandGroup>
														{templateOptions.map(template => (
															<CommandItem
																key={template.value}
																value={template.value}
																onSelect={() => {
																	setValue('templateId', template.value, { shouldValidate: true })
																	setTemplateOpen(false)
																}}>
																<Icons.check
																	className={`mr-2 h-4 w-4 ${template.value === field.value ? 'opacity-100' : 'opacity-0'}`}
																/>
																{template.label}
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
					</>
				)}
			</CardContent>
		</Card>
	)
}
