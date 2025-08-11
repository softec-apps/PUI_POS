'use client'

import { toast } from 'sonner'
import { Icons } from '@/components/icons'
import { useEffect, useState } from 'react'
import { FileText, FileSpreadsheet, ChevronDown, ChevronRight } from 'lucide-react'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
	SheetClose,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/layout/atoms/Badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export type ExportFormat = 'pdf' | 'xlsx'

interface ColumnOption {
	id: string
	label: string
	selected: boolean
	type?: 'text' | 'number' | 'date' | 'boolean'
	group?: string
}

interface ColumnGroup {
	name: string
	label: string
	icon?: React.ReactNode
	columns: ColumnOption[]
	isOpen: boolean
}

const exportOptions = [
	{
		format: 'xlsx' as const,
		label: 'Excel',
		icon: <Icons.fileTypeXls className='h-7 w-7 text-green-600' />,
		description: 'Ideal para análisis de datos y edición',
		recommended: true,
	},
	{
		format: 'pdf' as const,
		label: 'PDF',
		icon: <Icons.fileTypePdf className='text-destructive h-7 w-7' />,
		description: 'Perfecto para compartir y presentar',
	},
]

// Configuración de grupos predeterminados
const defaultGroupConfig: Record<string, { label: string; icon: React.ReactNode }> = {
	basic: {
		label: 'Información Básica',
		icon: <Icons.user className='h-4 w-4' />,
	},
	dates: {
		label: 'Fechas',
		icon: <Icons.calendar className='h-4 w-4' />,
	},
	status: {
		label: 'Estados',
		icon: <Icons.server className='h-4 w-4' />,
	},
	media: {
		label: 'Archivos',
		icon: <Icons.media className='h-4 w-4' />,
	},
	contact: {
		label: 'Contacto',
		icon: <Icons.mail className='h-4 w-4' />,
	},
	financial: {
		label: 'Financiero',
		icon: <Icons.dots className='h-4 w-4' />,
	},
}

interface ExportReportProps {
	title?: string
	onExport: (format: ExportFormat, selectedColumns?: string[]) => Promise<void> | void
	data?: any[]
	disabled?: boolean
	size?: 'sm' | 'lg'
	variant?: 'default' | 'ghost' | 'secondary'
	className?: string

	columnLabels?: Record<string, string>
	columnTypes?: Record<string, ColumnOption['type']>
	excludeColumns?: string[]

	// NUEVO: Configuración de grupos
	columnGroups?: Record<string, string[]>
	customGroupConfig?: Record<string, { label: string; icon?: React.ReactNode }>
}

// Función para detectar grupo automáticamente
const detectColumnGroup = (key: string, type?: string): string => {
	const lowerKey = key.toLowerCase()

	// Fechas
	if (type === 'date' || lowerKey.includes('date') || lowerKey.includes('at') || lowerKey.includes('time')) {
		return 'dates'
	}

	// Estados y booleanos
	if (
		type === 'boolean' ||
		lowerKey.includes('status') ||
		lowerKey.includes('active') ||
		lowerKey.includes('enabled')
	) {
		return 'status'
	}

	// Medios
	if (
		lowerKey.includes('photo') ||
		lowerKey.includes('image') ||
		lowerKey.includes('avatar') ||
		lowerKey.includes('file')
	) {
		return 'media'
	}

	// Contacto
	if (lowerKey.includes('email') || lowerKey.includes('phone') || lowerKey.includes('address')) {
		return 'contact'
	}

	// Financiero
	if (
		type === 'number' &&
		(lowerKey.includes('price') ||
			lowerKey.includes('cost') ||
			lowerKey.includes('salary') ||
			lowerKey.includes('total'))
	) {
		return 'financial'
	}

	// Por defecto: básico
	return 'basic'
}

export function ExportReport({
	title = 'Exportar',
	onExport,
	data = [],
	disabled = false,
	size = 'lg',
	variant = 'default',
	className = '',
	columnLabels = {},
	columnTypes = {},
	excludeColumns = ['__typename', 'deletedAt'],
	columnGroups,
	customGroupConfig = {},
}: ExportReportProps) {
	const [isExporting, setIsExporting] = useState<ExportFormat | null>(null)
	const [isSheetOpen, setIsSheetOpen] = useState(false)
	const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('xlsx')
	const [groups, setGroups] = useState<Record<string, ColumnGroup>>({})

	// Combinar configuración de grupos
	const groupConfig = { ...defaultGroupConfig, ...customGroupConfig }

	useEffect(() => {
		if (data && data.length > 0) {
			const firstItem = data[0]
			const allColumns = Object.keys(firstItem)
				.filter(key => !excludeColumns.includes(key))
				.map(key => ({
					id: key,
					selected: true,
					label: columnLabels[key] || formatColumnLabel(key),
					type: columnTypes[key] || getColumnType(key, firstItem[key]),
					group: getColumnGroup(key, columnTypes[key]),
				}))

			// Agrupar columnas
			const groupedColumns: Record<string, ColumnGroup> = {}

			allColumns.forEach(column => {
				const groupName = column.group!
				if (!groupedColumns[groupName]) {
					groupedColumns[groupName] = {
						name: groupName,
						label: groupConfig[groupName]?.label || formatColumnLabel(groupName),
						icon: groupConfig[groupName]?.icon,
						columns: [],
						isOpen: groupName === 'basic' || groupName === 'dates', // Abrir básico y fechas por defecto
					}
				}
				groupedColumns[groupName].columns.push(column)
			})

			setGroups(groupedColumns)
		}
	}, [data, columnLabels, columnTypes, excludeColumns])

	const getColumnGroup = (key: string, type?: string): string => {
		// Si hay configuración manual de grupos
		if (columnGroups) {
			for (const [groupName, columns] of Object.entries(columnGroups)) {
				if (columns.includes(key)) return groupName
			}
		}

		// Detección automática
		return detectColumnGroup(key, type)
	}

	const formatColumnLabel = (key: string): string => {
		const withSpaces = key.replace(/([A-Z])/g, ' $1')
		return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim()
	}

	const getColumnType = (key: string, value: any): ColumnOption['type'] => {
		if (columnTypes[key]) return columnTypes[key]

		if (key.includes('At') || key.includes('date') || key.includes('Date')) return 'date'
		if (typeof value === 'number') return 'number'
		if (typeof value === 'boolean') return 'boolean'
		return 'text'
	}

	const handleConfirmExport = async () => {
		if (!selectedFormat) return

		const allColumns = Object.values(groups).flatMap(group => group.columns)
		const selectedColumns = allColumns.filter(col => col.selected).map(col => col.id)

		if (selectedColumns.length === 0) {
			toast.error('Seleccione al menos una columna', {
				description: 'Debe seleccionar al menos una columna para exportar.',
			})
			return
		}

		setIsSheetOpen(false)
		setIsExporting(selectedFormat)

		try {
			await onExport(selectedFormat, selectedColumns)
			toast.success('¡Exportación completada!', {
				description: `Su archivo ${selectedFormat.toUpperCase()} se ha descargado correctamente.`,
			})
		} catch (error) {
			console.error(`Error exporting ${selectedFormat}:`, error)
			toast.error('Error en la exportación', {
				description: `Ocurrió un problema al generar el archivo ${selectedFormat.toUpperCase()}.`,
			})
		} finally {
			setIsExporting(null)
		}
	}

	const toggleGroupExpansion = (groupName: string) => {
		setGroups(prev => ({
			...prev,
			[groupName]: {
				...prev[groupName],
				isOpen: !prev[groupName].isOpen,
			},
		}))
	}

	const toggleColumnSelection = (groupName: string, columnId: string) => {
		setGroups(prev => ({
			...prev,
			[groupName]: {
				...prev[groupName],
				columns: prev[groupName].columns.map(col => (col.id === columnId ? { ...col, selected: !col.selected } : col)),
			},
		}))
	}

	const toggleGroupSelection = (groupName: string) => {
		const group = groups[groupName]
		const allSelected = group.columns.every(col => col.selected)

		setGroups(prev => ({
			...prev,
			[groupName]: {
				...prev[groupName],
				columns: prev[groupName].columns.map(col => ({ ...col, selected: !allSelected })),
			},
		}))
	}

	const toggleAllColumns = () => {
		const allColumns = Object.values(groups).flatMap(group => group.columns)
		const allSelected = allColumns.every(col => col.selected)

		setGroups(prev => {
			const updated = { ...prev }
			Object.keys(updated).forEach(groupName => {
				updated[groupName] = {
					...updated[groupName],
					columns: updated[groupName].columns.map(col => ({ ...col, selected: !allSelected })),
				}
			})
			return updated
		})
	}

	const allColumns = Object.values(groups).flatMap(group => group.columns)
	const selectedColumns = allColumns.filter(col => col.selected)
	const selectedCount = selectedColumns.length
	const totalCount = allColumns.length

	return (
		<>
			<ActionButton
				size={size}
				variant={variant}
				icon={isExporting ? <Icons.refresh className='h-4 w-4 animate-spin' /> : <Icons.download className='h-4 w-4' />}
				text={isExporting ? 'Exportando...' : title}
				disabled={disabled || !!isExporting || data.length === 0}
				className={className}
				onClick={() => setIsSheetOpen(true)}
			/>

			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
				<SheetContent className='flex w-full flex-col sm:max-w-xl'>
					<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b pb-4 supports-[backdrop-filter]:backdrop-blur-sm'>
						<div className='flex items-center justify-between'>
							<SheetTitle>Configurar exportación</SheetTitle>
							<SheetClose>
								<ActionButton
									type='button'
									variant='ghost'
									size='icon'
									disabled={!!isExporting}
									icon={<Icons.x className='h-4 w-4' />}
								/>
							</SheetClose>
						</div>
						<SheetDescription>
							Personalice su reporte seleccionando el formato y las columnas a incluir
						</SheetDescription>
					</SheetHeader>

					<div className='flex-1 space-y-10 overflow-y-auto px-4'>
						{/* Formato */}
						<Card className='border-none bg-transparent p-0 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.file className='h-4 w-4' />
									Formato de archivo
								</CardTitle>
								<CardDescription>Selecciona el formato en el que deseas exportar los datos</CardDescription>
							</CardHeader>

							<div className='grid grid-cols-2 gap-3'>
								{exportOptions.map(option => (
									<Card
										key={option.format}
										className={`h-full cursor-pointer p-3 shadow-none transition-all duration-500 ease-in-out ${
											selectedFormat === option.format
												? 'border-primary bg-accent/30'
												: 'border-border hover:bg-muted/50'
										} flex flex-col items-center rounded-2xl`}
										onClick={() => setSelectedFormat(option.format)}>
										<div
											className={`rounded-lg p-3 ${
												selectedFormat === option.format ? 'bg-muted text-primary' : 'bg-muted text-muted-foreground'
											}`}>
											{option.icon}
										</div>
										<div className='flex flex-col items-center gap-1'>
											<span className='text-base font-medium uppercase'>{option.format}</span>
											<span className='text-muted-foreground text-xs font-medium'>{option.description}</span>
										</div>
									</Card>
								))}
							</div>
						</Card>

						{/* Columnas agrupadas */}
						<Card className='border-none bg-transparent p-0 shadow-none'>
							<CardHeader className='p-0'>
								<CardTitle className='flex items-center gap-2 text-lg'>
									<Icons.list className='h-4 w-4' />
									Columnas a exportar
								</CardTitle>
								<CardDescription>Elige qué columnas incluir en el archivo de exportación</CardDescription>
							</CardHeader>

							<div className='flex items-center justify-between gap-4'>
								<p className='flex items-center gap-2 font-semibold'>
									Seleccionadas
									<Badge variant='default' text={`${selectedCount}/${totalCount}`} />
								</p>
								<Button variant='ghost' size='sm' onClick={toggleAllColumns}>
									{allColumns.every(col => col.selected) ? 'Deseleccionar todo' : 'Seleccionar todo'}
								</Button>
							</div>

							<div className='space-y-4'>
								{Object.values(groups).map(group => (
									<Collapsible
										key={group.name}
										open={group.isOpen}
										onOpenChange={() => toggleGroupExpansion(group.name)}>
										<Card className='dark:bg-card bg-accent/50 border-none p-4 shadow-none'>
											<CollapsibleTrigger className='flex w-full cursor-pointer items-center justify-between text-left'>
												<div className='flex items-center gap-3'>
													{group.icon}
													<span className='font-medium'>{group.label}</span>
													<Badge
														variant='secondary'
														text={`${group.columns.filter(col => col.selected).length}/${group.columns.length}`}
													/>
												</div>
												<div className='flex items-center gap-2'>
													<Button
														variant='ghost'
														size='sm'
														onClick={e => {
															e.stopPropagation()
															toggleGroupSelection(group.name)
														}}>
														{group.columns.every(col => col.selected) ? 'Deseleccionar' : 'Seleccionar'}
													</Button>
													{group.isOpen ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
												</div>
											</CollapsibleTrigger>

											<CollapsibleContent className='mt-3 space-y-2'>
												{group.columns.map(column => (
													<div
														key={column.id}
														className='hover:bg-accent/50 flex items-center space-x-3 rounded-lg px-2 py-1'>
														<Checkbox
															id={`${group.name}-${column.id}`}
															checked={column.selected}
															onCheckedChange={() => toggleColumnSelection(group.name, column.id)}
														/>
														<Label htmlFor={`${group.name}-${column.id}`} className='flex-1 cursor-pointer text-sm'>
															{column.label}
														</Label>
														<Badge variant='info' text={column.type || 'text'} />
													</div>
												))}
											</CollapsibleContent>
										</Card>
									</Collapsible>
								))}
							</div>
						</Card>
					</div>

					<SheetFooter className='border-t pt-4'>
						<div className='flex justify-end gap-3'>
							<ActionButton
								type='button'
								variant='ghost'
								onClick={() => setIsSheetOpen(false)}
								disabled={!!isExporting}
								text='Cancelar'
								icon={<Icons.x className='h-4 w-4' />}
							/>

							<Button
								onClick={handleConfirmExport}
								disabled={!!isExporting || selectedColumns.length === 0}
								className='min-w-32'>
								{isExporting ? (
									<>
										<Icons.refresh className='h-4 w-4 animate-spin' />
										Exportando...
									</>
								) : (
									<>
										<Icons.download className='h-4 w-4' />
										Exportar
									</>
								)}
							</Button>
						</div>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	)
}
