'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Icons } from '@/components/icons'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

type UniversalFormFieldProps<T extends FieldValues> = {
	control: Control<T>
	name: FieldPath<T>
	label: string
	placeholder?: string
	description?: string | ReactNode
	type?: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'switch' | 'checkbox' | 'select'
	required?: boolean
	className?: string
	options?: { value: string; label: string }[]
	min?: number
	max?: number
	step?: number
	disabled?: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onChange?: (value: any) => void
	switchContainerClass?: string
	showValidationIcons?: boolean
}

export function UniversalFormField<T extends FieldValues>({
	control,
	name,
	label,
	placeholder,
	description,
	type = 'text',
	required = false,
	className = 'transition-all duration-200 focus:ring-2',
	options,
	min,
	max,
	step,
	disabled = false,
	onChange,
	switchContainerClass = '',
	showValidationIcons = true,
}: UniversalFormFieldProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field, fieldState }) => {
				const hasError = !!fieldState.error
				const hasValue = field.value !== undefined && field.value !== null && field.value !== ''
				const isValid = !hasError && hasValue
				const isDirty = fieldState.isDirty

				// Función para renderizar el icono de validación
				const renderValidationIcon = () => {
					if (!showValidationIcons || type === 'switch' || type === 'checkbox') return null

					if (hasError) {
						return (
							<Icons.alertCircle className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-red-400' />
						)
					}

					// Mostrar check verde cuando es válido (sin importar si está dirty)
					if (isValid) {
						return (
							<Icons.checkCircle className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-emerald-400' />
						)
					}

					// Mostrar info amarilla solo cuando está dirty, es requerido y no tiene valor
					if (required && !hasValue && isDirty) {
						return (
							<Icons.infoCircle className='absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-amber-400' />
						)
					}

					return null
				}

				// Clases dinámicas basadas en el estado
				const inputClasses = cn(
					className,
					hasError && 'border-red-400 focus:ring-red-400 focus:border-red-400',
					isValid && 'border-emerald-400 focus:ring-emerald-400 focus:border-emerald-400',
					showValidationIcons && type !== 'textarea' && 'pr-10 w-full'
				)

				const textareaClasses = cn(
					className,
					hasError && 'border-red-400 focus:ring-red-400 focus:border-red-400',
					isValid && 'border-emerald-400 focus:ring-emerald-400 focus:border-emerald-400'
				)

				return type === 'switch' ? (
					<FormItem
						className={`bg-muted/20 flex flex-row items-center justify-between rounded-lg border p-4 ${switchContainerClass}`}>
						<div className='space-y-0.5'>
							<FormLabel>{label}</FormLabel>
							{description && <FormDescription>{description}</FormDescription>}
						</div>

						<FormControl>
							<div className='flex items-center gap-2'>
								<Label className='text-muted-foreground text-sm'>{field.value ? 'Activo' : 'Inactivo'}</Label>
								<Switch
									checked={field.value}
									onCheckedChange={value => {
										field.onChange(value)
										onChange?.(value)
									}}
									disabled={disabled}
								/>
							</div>
						</FormControl>
					</FormItem>
				) : (
					<FormItem>
						<div className='flex items-center gap-1'>
							<FormLabel>{label}</FormLabel>
							{required && <span className='text-destructive'>*</span>}
						</div>

						<FormControl>
							<div className='relative'>
								{type === 'textarea' ? (
									<>
										<Textarea placeholder={placeholder} {...field} className={textareaClasses} disabled={disabled} />
										{showValidationIcons && (
											<div className='absolute top-3 right-3'>
												{hasError && <Icons.alertSquareRounded className='h-4 w-4 text-red-400' />}
												{isValid && <Icons.checkCircle className='h-4 w-4 text-emerald-400' />} {/* Removido isDirty */}
												{required && !hasValue && isDirty && <Icons.infoCircle className='h-4 w-4 text-amber-400' />}
											</div>
										)}
									</>
								) : type === 'checkbox' ? (
									<div className='flex items-center gap-2'>
										<Checkbox
											checked={field.value}
											onCheckedChange={value => {
												field.onChange(value)
												onChange?.(value)
											}}
											disabled={disabled}
											className={cn(
												hasError && 'border-red-400',
												isValid && 'border-emerald-400 data-[state=checked]:bg-emerald-400'
											)}
										/>
										{showValidationIcons && hasError && <Icons.alertSquareRounded className='h-4 w-4 text-red-400' />}
										{showValidationIcons && isValid && <Icons.checkCircle className='h-4 w-4 text-emerald-400' />}
									</div>
								) : type === 'select' ? (
									<>
										<Select
											onValueChange={value => {
												field.onChange(value)
												onChange?.(value)
											}}
											value={field.value}
											disabled={disabled}>
											<SelectTrigger className={inputClasses}>
												<SelectValue placeholder={placeholder} />
											</SelectTrigger>

											<SelectContent>
												{options?.map(option => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										{renderValidationIcon()}
									</>
								) : (
									<>
										<Input
											placeholder={placeholder}
											{...field}
											type={type}
											className={inputClasses}
											min={min}
											max={max}
											step={step}
											disabled={disabled}
											onChange={e => {
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
												let value: any = e.target.value
												if (type === 'number') value = value === '' ? null : Number(value)
												field.onChange(value)
												onChange?.(value)
											}}
											value={field.value ?? ''}
										/>
										{renderValidationIcon()}
									</>
								)}
							</div>
						</FormControl>

						<div className='flex items-center justify-between'>
							{description && (
								<FormDescription
									className={cn(hasError && 'text-muted-foreground', isValid && 'text-muted-foreground')}>
									{description}
								</FormDescription>
							)}
							<FormMessage />
						</div>
					</FormItem>
				)
			}}
		/>
	)
}
