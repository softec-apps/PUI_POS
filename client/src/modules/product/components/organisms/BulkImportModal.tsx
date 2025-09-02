'use client'

import api from '@/lib/axios'
import { toast } from 'sonner'
import { useState, useRef, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/layout/atoms/Badge'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetFooter, SheetHeader } from '@/components/ui/sheet'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Form } from '@/components/ui/form'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { useProduct } from '@/common/hooks/useProduct'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// ==================== SCHEMAS ====================
const productEditSchema = z.object({
	identification: z.string().max(20, 'Máximo 20 caracteres').min(1, 'Es requerida'),
	upcEanIsbn: z.preprocess(
		value => (typeof value === 'number' ? value.toString() : value),
		z.string().max(20, 'Máximo 20 caracteres').min(1, 'Es requerida')
	),
	itemName: z.string().min(1, 'Es requerido').max(255, 'Máximo 255 caracteres'),
	category: z.string().max(255, 'Máximo 255 caracteres').min(1, 'Es requerida'),
	companyName: z.string().max(255, 'Máximo 255 caracteres').min(1, 'Es requerida'),
	wholesalePrice: z.number().nonnegative('Debe ser positivo').multipleOf(0.000001, 'Máximo 6 decimales').optional(),
	unitPrice: z.number().positive('El precio de venta debe ser mayor a 0').multipleOf(0.000001, 'Máximo 6 decimales'),
	stockQuantity: z.number().int('Debe ser un número entero').nonnegative('Debe ser positivo'),
	taxPercentage: z.number().refine(val => val === 0 || val === 15, {
		message: 'Debe ser 0% (exento) o 15% (con IVA)',
	}),
})

// ==================== TYPES ====================
type ProductEditFormData = z.infer<typeof productEditSchema>

interface BulkImportModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
}

interface ProductPreview {
	identification?: string
	upcEanIsbn?: string
	itemName?: string
	category?: string
	companyName?: string
	wholesalePrice?: number
	unitPrice?: number
	stockQuantity?: number
	taxPercentage?: number
	avatar?: string
	Identificación?: string
	'UPC/EAN/ISBN'?: string
	'Nombre Artículo'?: string
	Categoría?: string
	'Nombre de la Compañia'?: string
	'Precio al Por Mayor'?: number
	'Precio de Venta'?: number
	'Cantidad en Stock'?: number
	'Porcentaje de Impuesto(s)'?: number
	Avatar?: string
}

interface ValidationStats {
	newCategories: string[]
	newCompanies: string[]
	existingProducts: number
	duplicatedBarcodes: string[]
	invalidPrices: number
	missingRequiredFields: number
}

interface ValidationResult {
	isValid: boolean
	errors: string[]
	warnings: string[]
	totalRows: number
	previewData?: ProductPreview[]
	stats?: ValidationStats
}

// ==================== VALIDATION MODULE ====================
class ValidationModule {
	static validateTaxValues(previewData: ProductPreview[]): string[] {
		const errors: string[] = []

		previewData.forEach((item, index) => {
			const normalized = DataNormalizer.normalize(item)
			const taxValue = normalized.taxPercentage
			const rowNumber = index + 2 // +2 porque la fila 1 son headers

			if (taxValue === undefined || taxValue === null) {
				errors.push(`Fila ${rowNumber}: El campo de impuestos está vacío`)
			} else if (taxValue !== 0 && taxValue !== 15) {
				errors.push(`Fila ${rowNumber}: Valor de impuesto inválido (${taxValue}%). Debe ser 0% o 15%`)
			}
		})

		return errors
	}

	static validateFileExtension(fileName: string): boolean {
		const validExtensions = ['.xlsx', '.xls']
		const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
		return validExtensions.includes(fileExtension)
	}

	static async validateExcelFile(file: File): Promise<ValidationResult> {
		try {
			const formData = new FormData()
			formData.append('file', file)

			const response = await api.post('/product/bulk-import/validate-excel', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			const validationData = response.data.data

			if (validationData.previewData && validationData.previewData.length > 0) {
				const taxErrors = ValidationModule.validateTaxValues(validationData.previewData)

				if (taxErrors.length > 0) {
					validationData.errors = [...(validationData.errors || []), ...taxErrors]
					validationData.isValid = false
				}
			}

			return validationData
		} catch (error: any) {
			console.error('Error en validación:', error)
			throw new Error(error.response?.data?.message || 'Error al validar el archivo Excel')
		}
	}

	// NUEVA FUNCIÓN: Re-validar después de cambios
	static revalidateData(validationData: ValidationResult): ValidationResult {
		if (!validationData.previewData || validationData.previewData.length === 0) {
			return validationData
		}

		// Validar impuestos nuevamente
		const taxErrors = ValidationModule.validateTaxValues(validationData.previewData)

		// Limpiar errores previos de impuestos y agregar los nuevos
		const filteredErrors = (validationData.errors || []).filter(
			error => !error.includes('impuesto') && !error.includes('Valor de impuesto')
		)

		const updatedResult = {
			...validationData,
			errors: [...filteredErrors, ...taxErrors],
			isValid: taxErrors.length === 0 && filteredErrors.length === 0,
		}

		return updatedResult
	}
}

// ==================== DATA NORMALIZER MODULE ====================
class DataNormalizer {
	static normalize(data: ProductPreview): ProductPreview {
		return {
			identification: data['Identificación'] || data.identification || '',
			upcEanIsbn: data['UPC/EAN/ISBN'] || data.upcEanIsbn || '',
			itemName: data['Nombre Artículo'] || data.itemName || '',
			category: data['Categoría'] || data.category || '',
			companyName: data['Nombre de la Compañia'] || data.companyName || '',
			wholesalePrice: data['Precio al Por Mayor'] || data.wholesalePrice || 0,
			unitPrice: data['Precio de Venta'] || data.unitPrice || 0,
			stockQuantity: data['Cantidad en Stock'] || data.stockQuantity || 0,
			taxPercentage: data['Porcentaje de Impuesto(s)'] || data.taxPercentage || 0,
			avatar: data['Avatar'] || data.avatar || '',
		}
	}

	static getDisplayValue(data: ProductPreview, field: keyof ProductPreview): string | number {
		const normalized = DataNormalizer.normalize(data)

		switch (field) {
			case 'identification':
				return normalized.identification || '-'
			case 'upcEanIsbn':
				return normalized.upcEanIsbn || '-'
			case 'itemName':
				return normalized.itemName || '-'
			case 'category':
				return normalized.category || '-'
			case 'companyName':
				return normalized.companyName || '-'
			case 'wholesalePrice':
				return formatPrice(normalized?.wholesalePrice) || '-'
			case 'unitPrice':
				return formatPrice(normalized?.unitPrice) || '-'
			case 'stockQuantity':
				return normalized.stockQuantity || 0
			case 'taxPercentage':
				return normalized?.taxPercentage
			default:
				return '-'
		}
	}
}

// ==================== EXCEL MANAGER MODULE ====================
class ExcelManager {
	static async readExcelHeaders(file: File): Promise<string[]> {
		const arrayBuffer = await file.arrayBuffer()
		const workbook = XLSX.read(arrayBuffer, { type: 'array' })
		const sheetName = workbook.SheetNames[0]
		const worksheet = workbook.Sheets[sheetName]
		const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
		return jsonData.length > 0 ? (jsonData[0] as string[]) : []
	}

	static async createUpdatedExcelFile(
		previewData: ProductPreview[],
		headers: string[],
		originalFileName?: string
	): Promise<File> {
		if (previewData.length === 0 || headers.length === 0) {
			throw new Error('No hay datos para crear el archivo')
		}

		try {
			const newWorkbook = XLSX.utils.book_new()
			const sheetData = [headers]

			previewData.forEach(item => {
				const rowData: any[] = []

				headers.forEach(header => {
					switch (header) {
						case 'Identificación':
							rowData.push(item['Identificación'] || item.identification || '')
							break
						case 'UPC/EAN/ISBN':
							rowData.push(item['UPC/EAN/ISBN'] || item.upcEanIsbn || '')
							break
						case 'Nombre Artículo':
							rowData.push(item['Nombre Artículo'] || item.itemName || '')
							break
						case 'Categoría':
							rowData.push(item['Categoría'] || item.category || '')
							break
						case 'Nombre de la Compañia':
							rowData.push(item['Nombre de la Compañia'] || item.companyName || '')
							break
						case 'Precio al Por Mayor':
							rowData.push(item['Precio al Por Mayor'] || item.wholesalePrice || 0)
							break
						case 'Precio de Venta':
							rowData.push(item['Precio de Venta'] || item.unitPrice || 0)
							break
						case 'Cantidad en Stock':
							rowData.push(item['Cantidad en Stock'] || item.stockQuantity || 0)
							break
						case 'Porcentaje de Impuesto(s)':
							rowData.push(item['Porcentaje de Impuesto(s)'] || item.taxPercentage || 0)
							break
						case 'Avatar':
							rowData.push(item['Avatar'] || item.avatar || '')
							break
						default:
							rowData.push('')
					}
				})

				sheetData.push(rowData)
			})

			const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
			XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Productos')

			const excelBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' })

			const newFile = new File([excelBuffer], `editado_${originalFileName || 'productos.xlsx'}`, {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			})

			return newFile
		} catch (error) {
			console.error('Error creando archivo Excel:', error)
			throw new Error('Error al crear el archivo actualizado')
		}
	}

	static async downloadTemplate() {
		try {
			const response = await api.get('/product/bulk-import/excel-template', {
				responseType: 'blob',
			})

			const blob = new Blob([response.data], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheettml.sheet',
			})
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = 'template-productos.xlsx'
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)
			toast.success('Plantilla Excel descargada')
		} catch (error: any) {
			console.error(error)
			toast.error('No se pudo descargar la plantilla')
		}
	}
}

// ==================== TAX MANAGER MODULE ====================
class TaxManager {
	// FUNCIÓN CORREGIDA: Aplicar IVA y re-validar
	static applyTaxToAllProducts(validationResult: ValidationResult, taxValue: 0 | 15): ValidationResult {
		if (!validationResult?.previewData) return validationResult

		const updatedPreviewData = validationResult.previewData.map(item => {
			const normalized = DataNormalizer.normalize(item)
			return {
				...item,
				// Actualizar ambos formatos (español e inglés)
				'Porcentaje de Impuesto(s)': taxValue,
				taxPercentage: taxValue,
				// Mantener el resto de los campos normalizados
				Identificación: item['Identificación'] || normalized.identification,
				'UPC/EAN/ISBN': item['UPC/EAN/ISBN'] || normalized.upcEanIsbn,
				'Nombre Artículo': item['Nombre Artículo'] || normalized.itemName,
				Categoría: item['Categoría'] || normalized.category,
				'Nombre de la Compañia': item['Nombre de la Compañia'] || normalized.companyName,
				'Precio al Por Mayor': item['Precio al Por Mayor'] || normalized.wholesalePrice,
				'Precio de Venta': item['Precio de Venta'] || normalized.unitPrice,
				'Cantidad en Stock': item['Cantidad en Stock'] || normalized.stockQuantity,
				identification: item.identification || normalized.identification,
				upcEanIsbn: item.upcEanIsbn || normalized.upcEanIsbn,
				itemName: item.itemName || normalized.itemName,
				category: item.category || normalized.category,
				companyName: item.companyName || normalized.companyName,
				wholesalePrice: item.wholesalePrice || normalized.wholesalePrice,
				unitPrice: item.unitPrice || normalized.unitPrice,
				stockQuantity: item.stockQuantity || normalized.stockQuantity,
			}
		})

		// CREAR NUEVO RESULTADO CON DATOS ACTUALIZADOS
		const updatedResult = {
			...validationResult,
			previewData: updatedPreviewData,
		}

		// RE-VALIDAR DESPUÉS DEL CAMBIO
		return ValidationModule.revalidateData(updatedResult)
	}
}

// ==================== MAIN COMPONENT ====================
export function BulkImportModal({ open, onOpenChange, onSuccess }: BulkImportModalProps) {
	// ==================== STATES ====================
	const [activeTab, setActiveTab] = useState('excel')
	const [loading, setLoading] = useState(false)
	const [validating, setValidating] = useState(false)
	const [file, setFile] = useState<File | null>(null)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
	const [editingRow, setEditingRow] = useState<{ index: number; data: ProductPreview } | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
	const [headers, setHeaders] = useState<string[]>([])
	const [isEdited, setIsEdited] = useState(false)
	const [updateExisting, setUpdateExisting] = useState(true)
	const [continueOnError, setContinueOnError] = useState(true)
	const [taxDialogOpen, setTaxDialogOpen] = useState(false)
	const [pendingTaxValue, setPendingTaxValue] = useState<0 | 15 | null>(null)

	const fileInputRef = useRef<HTMLInputElement>(null)
	const { bulkImport, isBulkImporting } = useProduct()

	// ==================== FORM SETUP ====================
	const form = useForm<ProductEditFormData>({
		mode: 'all',
		resolver: zodResolver(productEditSchema),
		defaultValues: {
			identification: '',
			upcEanIsbn: '',
			itemName: '',
			category: '',
			companyName: '',
			wholesalePrice: 0,
			unitPrice: 0,
			stockQuantity: 0,
			taxPercentage: 0,
		},
	})

	const taxOptions = [
		{ value: '0', label: '0% - Exento de IVA' },
		{ value: '15', label: '15% - Con IVA' },
	]

	// ==================== STATE MANAGEMENT ====================
	const resetAllState = useCallback(() => {
		setFile(null)
		setUploadProgress(0)
		setValidationResult(null)
		setEditingRow(null)
		setDeleteConfirm(null)
		setHeaders([])
		setIsEdited(false)
		setUpdateExisting(true)
		setContinueOnError(true)
		setPendingTaxValue(null)
		form.reset()

		if (fileInputRef.current) fileInputRef.current.value = ''
	}, [form])

	// ==================== TAX DIALOG HANDLERS ====================
	const handleTaxDialogConfirm = useCallback(() => {
		if (pendingTaxValue !== null && validationResult) {
			// USAR LA FUNCIÓN CORREGIDA DEL MÓDULO
			const updatedResult = TaxManager.applyTaxToAllProducts(validationResult, pendingTaxValue)
			setValidationResult(updatedResult)
			setIsEdited(true)

			toast.success(`Todos los productos marcados con ${pendingTaxValue}% de impuesto`)
		}
		setTaxDialogOpen(false)
		setPendingTaxValue(null)
	}, [pendingTaxValue, validationResult])

	const openTaxDialog = useCallback((taxValue: 0 | 15) => {
		setPendingTaxValue(taxValue)
		setTaxDialogOpen(true)
	}, [])

	// ==================== FILE HANDLERS ====================
	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0]
		if (!selectedFile) return

		if (!ValidationModule.validateFileExtension(selectedFile.name)) {
			toast.error('Por favor, selecciona un archivo Excel válido (.xlsx o .xls)')
			return
		}

		resetAllState()
		setFile(selectedFile)

		try {
			const fileHeaders = await ExcelManager.readExcelHeaders(selectedFile)
			setHeaders(fileHeaders)
			await validateFile(selectedFile)
		} catch (error) {
			console.error('Error al procesar archivo:', error)
			toast.error('Error al procesar el archivo')
		}
	}

	const validateFile = async (fileToValidate: File) => {
		try {
			setValidating(true)
			setUploadProgress(0)

			const progressInterval = setInterval(() => {
				setUploadProgress(prev => (prev >= 90 ? 90 : prev + 10))
			}, 100)

			const validationData = await ValidationModule.validateExcelFile(fileToValidate)

			clearInterval(progressInterval)
			setUploadProgress(100)

			setValidationResult(validationData)

			if (validationData.isValid) {
				toast.success(`Archivo válido: ${validationData.totalRows} productos para importar`)
			} else {
				toast.error(`Archivo inválido: ${validationData.errors?.length || 0} errores encontrados`)
			}

			if (validationData.warnings && validationData.warnings.length > 0) {
				validationData.warnings.forEach((warning: string) => {
					toast.warning(warning)
				})
			}
		} catch (error: any) {
			console.error('Error en validación:', error)
			toast.error(error.message)
			setValidationResult({
				isValid: false,
				errors: ['Error al validar el archivo'],
				warnings: [],
				totalRows: 0,
			})
		} finally {
			setValidating(false)
		}
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		const files = e.dataTransfer.files
		if (files && files.length > 0) handleFileChange({ target: { files } } as any)
	}

	// ==================== IMPORT HANDLER ====================
	const handleSubmitImport = async () => {
		if (!file) {
			toast.error('Por favor, selecciona un archivo antes de importar')
			return
		}

		try {
			setLoading(true)

			let fileToImport = file
			if (isEdited && validationResult?.previewData) {
				fileToImport = await ExcelManager.createUpdatedExcelFile(validationResult.previewData, headers, file.name)
			}

			const responseData = await bulkImport(fileToImport, {
				continueOnError,
				updateExisting,
			})

			if (responseData.successCount > 0) {
				if (responseData.errorCount === 0) {
					onSuccess()
					setTimeout(() => {
						resetAllState()
						onOpenChange(false)
					}, 200)
				} else {
					toast.warning(
						`${responseData.successCount} productos procesados exitosamente, ${responseData.errorCount} con errores`
					)
					onSuccess()
				}
			}

			if (responseData.errorCount > 0) {
				if (responseData.successCount === 0) {
					toast.error(`${responseData.errorCount} productos con errores. Ningún producto fue procesado exitosamente.`)
				}

				if (responseData.errorMessages && responseData.errorMessages.length > 0) {
					responseData.errorMessages.slice(0, 3).forEach((message: string) => {
						toast.error(message)
					})
				}
			}
		} catch (error: any) {
			console.error('Error en importación:', error)
		} finally {
			setLoading(false)
		}
	}

	// ==================== ROW MANAGEMENT ====================
	const handleDeleteRow = useCallback(
		(index: number) => {
			if (!validationResult?.previewData) return

			const updatedPreviewData = [...validationResult.previewData]
			updatedPreviewData.splice(index, 1)

			const updatedResult = {
				...validationResult,
				previewData: updatedPreviewData,
				totalRows: updatedPreviewData.length,
			}

			// RE-VALIDAR DESPUÉS DE ELIMINAR FILA
			setValidationResult(ValidationModule.revalidateData(updatedResult))
			setIsEdited(true)
			setDeleteConfirm(null)
			toast.success('Fila eliminada del preview')
		},
		[validationResult]
	)

	const handleSaveEdit = async (formData: ProductEditFormData) => {
		if (!editingRow || !validationResult?.previewData) return

		try {
			const updatedPreviewData = validationResult.previewData.map((item, index) => {
				if (index === editingRow.index) {
					return {
						...item,
						// Actualizar datos en español
						Identificación: formData.identification,
						'UPC/EAN/ISBN': formData.upcEanIsbn || '',
						'Nombre Artículo': formData.itemName,
						Categoría: formData.category || '',
						'Nombre de la Compañia': formData.companyName || '',
						'Precio al Por Mayor': formData.wholesalePrice || 0,
						'Precio de Venta': formData.unitPrice,
						'Cantidad en Stock': formData.stockQuantity || 0,
						'Porcentaje de Impuesto(s)': formData.taxPercentage || 0,
						// Actualizar datos en inglés
						identification: formData.identification,
						upcEanIsbn: formData.upcEanIsbn || '',
						itemName: formData.itemName,
						category: formData.category || '',
						companyName: formData.companyName || '',
						wholesalePrice: formData.wholesalePrice || 0,
						unitPrice: formData.unitPrice,
						stockQuantity: formData.stockQuantity || 0,
						taxPercentage: formData.taxPercentage || 0,
					}
				}
				return item
			})

			const updatedResult = {
				...validationResult,
				previewData: updatedPreviewData,
			}

			// RE-VALIDAR DESPUÉS DE EDITAR
			setValidationResult(ValidationModule.revalidateData(updatedResult))
			setIsEdited(true)
			setEditingRow(null)
			toast.success('Cambios guardados correctamente')
		} catch (error) {
			console.error('Error al guardar cambios:', error)
			toast.error('Error al guardar los cambios')
		}
	}

	const handleExportEditedFile = async () => {
		try {
			if (!validationResult?.previewData) return

			const newFile = await ExcelManager.createUpdatedExcelFile(validationResult.previewData, headers, file?.name)

			const blob = new Blob([await newFile.arrayBuffer()], {
				type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			})

			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = newFile.name
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)

			toast.success('Archivo editado descargado correctamente')
		} catch (error) {
			console.error('Error al exportar archivo:', error)
			toast.error('Error al exportar el archivo editado')
		}
	}

	const handleClose = useCallback(() => {
		resetAllState()
		onOpenChange(false)
	}, [resetAllState, onOpenChange])

	// ==================== EFFECTS ====================
	useEffect(() => {
		if (editingRow) {
			const normalized = DataNormalizer.normalize(editingRow.data)
			form.reset({
				identification: normalized.identification || '',
				upcEanIsbn: normalized.upcEanIsbn || '',
				itemName: normalized.itemName || '',
				category: normalized.category || '',
				companyName: normalized.companyName || '',
				wholesalePrice: normalized.wholesalePrice || 0,
				unitPrice: normalized.unitPrice || 0,
				stockQuantity: normalized.stockQuantity || 0,
				taxPercentage: normalized.taxPercentage || 0,
			})
		}
	}, [editingRow, form])

	// ==================== RENDER ====================
	return (
		<Sheet open={open} onOpenChange={handleClose}>
			<SheetContent className='flex h-screen min-w-full flex-col rounded-none px-6 py-4'>
				<SheetHeader className='flex-shrink-0 pt-0 pb-0'>
					<DialogTitle className='flex items-center gap-2'>Importar productos desde Excel</DialogTitle>
					<DialogDescription>
						Importa múltiples productos a través de un archivo Excel (.xlsx o .xls).
					</DialogDescription>
				</SheetHeader>

				<div className='flex flex-1 flex-col overflow-hidden'>
					<Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-1 flex-col overflow-hidden'>
						<TabsContent value='excel' className='flex flex-1 flex-col space-y-6 overflow-hidden'>
							<AlertMessage
								variant='info'
								message={
									<div className='w-full'>
										<p className='flex items-center justify-between'>
											Para que la importación sea exitosa, ten en cuenta:
											<ActionButton
												text='Descargar plantilla'
												variant='link'
												onClick={ExcelManager.downloadTemplate}
												className='underline'
											/>
										</p>

										<div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-2'>
											<div>
												<ul className='list-inside list-disc'>
													<li>
														<strong>Identificación</strong>: Se toma como <strong>SKU</strong> (máximo 20 caracteres).
													</li>
													<li>
														<strong>Código UPC/EAN</strong>: Se utiliza como <strong>código de barras</strong> (máximo
														50 caracteres).
													</li>
												</ul>
											</div>
											<div>
												<ul className='list-inside list-disc'>
													<li>
														<strong>Impuestos</strong>: Debe cumplir con el estándar del <strong>SRI</strong>. Ingrese{' '}
														<strong>15</strong> con IVA (15%) o <strong>0</strong> exentos de IVA.
													</li>
													<li>
														<strong>Categoría/Compañía/Proveedor (Proveedor)</strong>: Si no existe en el sistema, se
														creará automáticamente.
													</li>
												</ul>
											</div>
										</div>
									</div>
								}
							/>

							{validationResult?.errors && validationResult?.errors?.length > 0 && (
								<AlertMessage
									dismissible
									title='Errores encontrados'
									variant='destructive'
									message={
										<ul className='list-inside list-disc space-y-1'>
											{validationResult.errors.slice(0, 5).map((error, index) => (
												<li key={index} className='text-sm'>
													{error}
												</li>
											))}
										</ul>
									}
								/>
							)}

							{validationResult?.warnings && validationResult?.warnings?.length > 0 && (
								<AlertMessage
									dismissible
									title='Advertencias'
									variant='warning'
									message={
										<ul className='list-inside list-disc space-y-1'>
											{validationResult.warnings.slice(0, 10).map((warning, index) => (
												<li key={index} className='text-sm'>
													{warning}
												</li>
											))}
											{validationResult.warnings.length > 5 && (
												<li className='text-sm'>... y {validationResult.warnings.length - 5} advertencias más</li>
											)}
										</ul>
									}
								/>
							)}

							{!file ? (
								<Card
									className='hover:border-primary flex-shrink-0 cursor-pointer border-2 border-dashed transition-all duration-500'
									onDragOver={handleDragOver}
									onDrop={handleDrop}
									onClick={() => fileInputRef.current?.click()}>
									<CardContent className='text-primary flex flex-col items-center justify-center p-8 text-center'>
										<Icons.cloudUpload className='text-muted-foreground mb-4 h-12 w-12' />
										<h3 className='mb-2 font-medium'>Arrastra y suelta tu archivo Excel</h3>
										<p className='text-muted-foreground mb-4 text-sm'>
											O haz clic para seleccionar un archivo (.xlsx o .xls)
										</p>
										<Button variant='secondary'>Seleccionar archivo</Button>
										<input
											ref={fileInputRef}
											type='file'
											accept='.xlsx,.xls'
											onChange={handleFileChange}
											className='hidden'
										/>
									</CardContent>
								</Card>
							) : (
								<div className='flex flex-1 flex-col space-y-4 overflow-hidden'>
									<div className='flex flex-shrink-0 items-center justify-between'>
										<div className='flex items-center gap-2'>
											<Icons.fileText className='text-primary h-5 w-5' />
											<span className='font-medium'>{file.name}</span>
											{validationResult && (
												<Badge
													variant={validationResult.isValid ? 'success' : 'destructive'}
													text={
														validationResult.isValid
															? `${validationResult.totalRows} productos${isEdited ? ' (editado)' : ''}`
															: 'Inválido'
													}
												/>
											)}
										</div>
									</div>

									<Card className='border-none bg-transparent p-0'>
										<CardContent className='p-0'>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-12'>
													<div className='flex items-center space-x-2'>
														<Switch id='update-existing' checked={updateExisting} onCheckedChange={setUpdateExisting} />
														<Label htmlFor='update-existing' className='cursor-pointer'>
															Actualizar productos existentes
														</Label>
													</div>

													<div className='flex items-center space-x-2'>
														<Switch
															id='continue-on-error'
															checked={continueOnError}
															onCheckedChange={setContinueOnError}
														/>
														<Label htmlFor='continue-on-error' className='cursor-pointer'>
															Continuar aunque haya errores
														</Label>
													</div>
												</div>

												<div className='flex gap-4'>
													<div className='flex gap-2'>
														<Button
															type='button'
															variant='secondary'
															size='sm'
															onClick={() => openTaxDialog(0)}
															disabled={!validationResult?.previewData}
															className='text-xs'>
															Marcar 0% IVA
														</Button>
														<Button
															type='button'
															variant='secondary'
															size='sm'
															onClick={() => openTaxDialog(15)}
															disabled={!validationResult?.previewData}
															className='text-xs'>
															Marcar 15% IVA
														</Button>
													</div>

													<div className='flex gap-2'>
														{validationResult?.previewData && (
															<ActionButton
																variant='secondary'
																size='icon'
																onClick={handleExportEditedFile}
																icon={<Icons.download />}
																tooltip='Exportar'
															/>
														)}

														<ActionButton
															variant='destructive'
															size='icon'
															onClick={resetAllState}
															icon={<Icons.trash />}
															tooltip='Remover archivo'
														/>
													</div>
												</div>
											</div>

											<p className='text-primary mt-3 text-sm'>
												{updateExisting
													? 'Los productos existentes se actualizarán con los nuevos datos'
													: 'Solo se crearán nuevos productos, los existentes se ignorarán'}
												{' - '}
												{continueOnError
													? 'La importación continuará aunque algunos productos tengan errores'
													: 'La importación se detendrá al primer error'}
											</p>
										</CardContent>
									</Card>

									{(uploadProgress > 0 && uploadProgress < 100) ||
										(validating && (
											<div className='flex-shrink-0 space-y-2'>
												<div className='flex justify-between text-sm'>
													<span>{validating ? 'Validando archivo...' : 'Procesando...'}</span>
													<span>{uploadProgress}%</span>
												</div>
												<Progress value={uploadProgress} className='h-2' />
											</div>
										))}

									{validationResult && (
										<div className='flex-1 space-y-4 overflow-auto'>
											{validationResult.previewData && (
												<Card className='border-none bg-transparent p-0'>
													<CardContent className='p-0'>
														<div className='overflow-x-auto'>
															<Table>
																<TableHeader>
																	<TableRow>
																		<TableHead>Identificación</TableHead>
																		<TableHead>Código UPC/EAN</TableHead>
																		<TableHead>Nombre</TableHead>
																		<TableHead>Categoría</TableHead>
																		<TableHead>Compañía/Proveedor</TableHead>
																		<TableHead>Costo</TableHead>
																		<TableHead>PVP</TableHead>
																		<TableHead>Stock</TableHead>
																		<TableHead>Impuesto %</TableHead>
																		<TableHead>Acciones</TableHead>
																	</TableRow>
																</TableHeader>

																<TableBody>
																	{validationResult.previewData.map((item, index) => (
																		<TableRow key={index}>
																			<TableCell className='font-mono text-sm'>
																				{DataNormalizer.getDisplayValue(item, 'identification')}
																			</TableCell>
																			<TableCell className='font-mono text-sm'>
																				{DataNormalizer.getDisplayValue(item, 'upcEanIsbn')}
																			</TableCell>
																			<TableCell className='max-w-[200px] truncate'>
																				{DataNormalizer.getDisplayValue(item, 'itemName')}
																			</TableCell>
																			<TableCell className='max-w-[200px] truncate'>
																				{DataNormalizer.getDisplayValue(item, 'category')}
																			</TableCell>
																			<TableCell className='max-w-[200px] truncate'>
																				{DataNormalizer.getDisplayValue(item, 'companyName')}
																			</TableCell>
																			<TableCell>${DataNormalizer.getDisplayValue(item, 'wholesalePrice')}</TableCell>
																			<TableCell>${DataNormalizer.getDisplayValue(item, 'unitPrice')}</TableCell>
																			<TableCell>{DataNormalizer.getDisplayValue(item, 'stockQuantity')}</TableCell>
																			<TableCell>
																				<Badge
																					variant={
																						DataNormalizer.getDisplayValue(item, 'taxPercentage') === 0
																							? 'outline'
																							: 'default'
																					}
																					text={`${DataNormalizer.getDisplayValue(item, 'taxPercentage')}`}
																				/>
																			</TableCell>
																			<TableCell>
																				<div className='flex gap-2'>
																					<Button
																						variant='ghost'
																						size='xs'
																						onClick={() => setEditingRow({ index, data: item })}>
																						<Icons.edit className='h-4 w-4' />
																					</Button>
																					<Button variant='secondary' size='xs' onClick={() => setDeleteConfirm(index)}>
																						<Icons.trash className='h-4 w-4' />
																					</Button>
																				</div>
																			</TableCell>
																		</TableRow>
																	))}
																</TableBody>
															</Table>
														</div>
													</CardContent>
												</Card>
											)}
										</div>
									)}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>

				{/* FOOTER CORREGIDO */}
				{validationResult?.previewData?.length && (
					<SheetFooter className='bg-background flex-shrink-0 p-0'>
						<div className='flex items-center justify-between text-sm'>
							<div className='min-w-sm'>
								<AlertMessage
									variant={validationResult.isValid ? 'success' : 'destructive'}
									title={
										validationResult.isValid
											? `${validationResult.totalRows} productos listos para importar${
													validationResult.stats?.existingProducts > 0
														? ` (${validationResult.stats.existingProducts} existentes)`
														: ''
												}`
											: `${validationResult.errors?.length || 0} errores encontrados - Corrige los errores antes de importar`
									}
								/>
							</div>

							{loading || isBulkImporting ? (
								<div className='bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md'>
									<SpinnerLoader text='Importando... Esta acción puede tardar un momento' />
								</div>
							) : (
								<Button
									onClick={handleSubmitImport}
									disabled={loading || isBulkImporting || !validationResult?.isValid}
									className='w-full gap-2 sm:w-auto'>
									<Icons.cloudUpload className='h-4 w-4' />
									Iniciar Importación
								</Button>
							)}
						</div>
					</SheetFooter>
				)}

				{/* ==================== DIALOGS ==================== */}

				{/* Diálogo de confirmación para eliminar fila */}
				<Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirmar eliminación</DialogTitle>
							<DialogDescription>
								¿Estás seguro de que deseas eliminar esta fila del preview? Esta acción no se puede deshacer.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant='outline'>Cancelar</Button>
							</DialogClose>
							<Button variant='destructive' onClick={() => handleDeleteRow(deleteConfirm!)}>
								Eliminar
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Diálogo para editar fila */}
				<Dialog open={editingRow !== null} onOpenChange={() => setEditingRow(null)}>
					<DialogContent className='max-h-[80vh] min-w-3xl space-y-4 overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>Editar producto</DialogTitle>
							<DialogDescription>
								Modifica los datos del producto. Los campos marcados con * son obligatorios.
							</DialogDescription>
						</DialogHeader>

						{editingRow && (
							<Form {...form}>
								<form onSubmit={form.handleSubmit(handleSaveEdit)}>
									<div className='grid grid-cols-2 gap-4'>
										<UniversalFormField
											required
											control={form.control}
											name='identification'
											label='Identificación'
											placeholder='SKU del producto'
											type='text'
										/>

										<UniversalFormField
											required
											control={form.control}
											name='upcEanIsbn'
											label='Código UPC/EAN'
											placeholder='Código de barras'
											type='text'
										/>
									</div>

									<UniversalFormField
										required
										control={form.control}
										name='itemName'
										label='Nombre Artículo'
										placeholder='Nombre del producto'
										type='text'
									/>

									<div className='grid grid-cols-2 gap-4'>
										<UniversalFormField
											required
											control={form.control}
											name='category'
											label='Categoría'
											placeholder='Categoría del producto'
											type='text'
										/>

										<UniversalFormField
											required
											control={form.control}
											name='companyName'
											label='Compañía/Proveedor'
											placeholder='Nombre de la compañía/Proveedor'
											type='text'
										/>
									</div>

									<div className='grid grid-cols-4 gap-4'>
										<UniversalFormField
											required
											control={form.control}
											name='wholesalePrice'
											label='Costo'
											type='number'
											step='0.000001'
											placeholder='0.00'
										/>

										<UniversalFormField
											control={form.control}
											required
											name='unitPrice'
											label='PVP'
											type='number'
											step='0.000001'
											placeholder='0.00'
										/>

										<UniversalFormField
											required
											control={form.control}
											name='stockQuantity'
											label='Stock'
											type='number'
											placeholder='0'
										/>

										<UniversalFormField
											required
											control={form.control}
											name='taxPercentage'
											label='Impuesto %'
											type='number'
											options={taxOptions}
											placeholder='Seleccione el impuesto'
										/>
									</div>

									<div className='col-span-2 flex justify-end gap-4 pt-4'>
										<DialogClose asChild>
											<Button type='button' variant='ghost'>
												Cancelar
											</Button>
										</DialogClose>
										<Button type='submit'>Guardar cambios</Button>
									</div>
								</form>
							</Form>
						)}
					</DialogContent>
				</Dialog>

				{/* DIÁLOGO DE CONFIRMACIÓN DE IVA */}
				<Dialog open={taxDialogOpen} onOpenChange={setTaxDialogOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirmar aplicación de impuesto</DialogTitle>
							<DialogDescription>
								¿Estás seguro de que deseas aplicar <strong>{pendingTaxValue}%</strong> de impuesto a todos los{' '}
								<strong>{validationResult?.totalRows || 0}</strong> productos?
							</DialogDescription>
						</DialogHeader>

						<AlertMessage
							variant={pendingTaxValue === 0 ? 'success' : 'info'}
							message={
								pendingTaxValue === 0
									? 'Todos los productos quedarán exentos de IVA (0%)'
									: 'Todos los productos tendrán IVA incluido (15%)'
							}
						/>

						<DialogFooter>
							<DialogClose asChild>
								<Button variant='ghost'>Cancelar</Button>
							</DialogClose>
							<Button onClick={handleTaxDialogConfirm}>Aplicar</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</SheetContent>
		</Sheet>
	)
}
