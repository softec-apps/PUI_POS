/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { utils, writeFile } from 'xlsx'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { useCallback, useEffect, useState } from 'react'
import { formatDate } from '@/common/utils/dateFormater-util'
import { useEstablishment } from '@/common/hooks/useEstablishment'

// Tipos de columna soportados
export type ColumnType =
	| 'text'
	| 'number'
	| 'date'
	| 'boolean'
	| 'enum'
	| 'image'
	| 'email'
	| 'phone'
	| 'currency'
	| 'status'
	| 'longtext'

// Configuración de mapeo para columnas
export interface ColumnMapping {
	type: ColumnType
	valueMap?: Record<string | number | boolean, string>
	format?: (value: any) => string
	maxWidth?: number
	wrapText?: boolean
	textOptions?: {
		maxCharsPerLine?: number
		lineHeight?: number
		fontSize?: number
		textColor?: [number, number, number]
	}
}

// Configuración del encabezado (simplificada, ya que será automático)
export interface EstablishmentHeaderConfig {
	showHeader?: boolean // Por defecto será true
	showLogo?: boolean
	logoMaxWidth?: number
	logoMaxHeight?: number
	showCompanyInfo?: boolean
	backgroundColor?: [number, number, number]
	textColor?: [number, number, number]
	borderColor?: [number, number, number]
	fontSize?: {
		companyName?: number
		tradeName?: number
		details?: number
	}
}

// Configuración principal del exportador
export interface ExportConfig {
	fileName: string
	reportTitle: string
	columnLabels?: Record<string, string>
	columnMappings?: Record<string, ColumnMapping>
	pdfConfig?: {
		orientation?: 'portrait' | 'landscape'
		fontSize?: number
		headerColor?: [number, number, number]
		groupDateAtColumns?: boolean
		longTextOptions?: {
			defaultMaxCharsPerLine?: number
			defaultLineHeight?: number
			defaultFontSize?: number
			defaultTextColor?: [number, number, number]
		}
		tableStyle?: {
			cellPadding?: number
			lineWidth?: number
			lineColor?: [number, number, number]
			alternateFillColor?: [number, number, number]
		}
		// Configuración opcional del encabezado (si quiere personalizar)
		establishmentHeader?: EstablishmentHeaderConfig
	}
	formatValue?: (key: string, value: any) => string
	excludeColumns?: string[]
	transformData?: (data: any[]) => any[]
}

async function loadImageAsBase64(url: string): Promise<string> {
	try {
		const response = await fetch(url)
		const blob = await response.blob()
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result as string)
			reader.onerror = reject
			reader.readAsDataURL(blob)
		})
	} catch (e) {
		console.error('Error cargando imagen:', e)
		return ''
	}
}

const date = new Date()
const formattedDateTime = date.toISOString().replace('T', '_').replace(/:/g, '-').split('.')[0] // YYYY-MM-DD_HH-mm-ss

export function useGenericExport(config: ExportConfig) {
	const {
		fileName,
		reportTitle,
		columnLabels = {},
		columnMappings = {},
		pdfConfig = {},
		formatValue,
		excludeColumns = ['__typename'],
		transformData,
	} = config

	// 🏢 Hook para obtener datos del establecimiento automáticamente
	const { recordsData: establishmentsData } = useEstablishment({
		page: 1,
		limit: 1, // Solo necesitamos el primero disponible
	})

	// Estado para almacenar los datos del establecimiento principal
	const [establishmentData, setEstablishmentData] = useState<any>(null)
	const [isLoadingEstablishment, setIsLoadingEstablishment] = useState(true)

	// 🔄 Cargar automáticamente el primer establecimiento disponible
	useEffect(() => {
		const loadEstablishment = async () => {
			try {
				if (establishmentsData?.data.items?.length > 0) {
					const firstEstablishment = establishmentsData.data.items[0]
					setEstablishmentData(firstEstablishment)
				}
			} catch (error) {
				console.warn('Error cargando establecimiento por defecto:', error)
			} finally {
				setIsLoadingEstablishment(false)
			}
		}

		loadEstablishment()
	}, [establishmentsData])

	// Configuración por defecto para contenido extenso
	const defaultTextOptions = {
		maxCharsPerLine: pdfConfig.longTextOptions?.defaultMaxCharsPerLine || 80,
		lineHeight: pdfConfig.longTextOptions?.defaultLineHeight || 1.2,
		fontSize: pdfConfig.longTextOptions?.defaultFontSize || 9,
		textColor: pdfConfig.longTextOptions?.defaultTextColor || [70, 70, 70],
	}

	// Configuración de estilo de tabla por defecto
	const defaultTableStyle = {
		cellPadding: pdfConfig.tableStyle?.cellPadding ?? 3,
		lineWidth: pdfConfig.tableStyle?.lineWidth ?? 0.2,
		lineColor: pdfConfig.tableStyle?.lineColor ?? [200, 200, 200],
		alternateFillColor: pdfConfig.tableStyle?.alternateFillColor ?? [245, 245, 245],
	}

	// 🎨 Configuración por defecto del encabezado del establecimiento
	const defaultHeaderConfig: Required<EstablishmentHeaderConfig> = {
		showHeader: true,
		showLogo: true,
		logoMaxWidth: 30,
		logoMaxHeight: 25,
		showCompanyInfo: true,
		backgroundColor: [248, 249, 250],
		textColor: [33, 37, 41],
		borderColor: [206, 212, 218],
		fontSize: {
			companyName: 16,
			tradeName: 14,
			details: 10,
		},
		// Mezclar con configuración personalizada del usuario
		...pdfConfig.establishmentHeader,
	}

	// 🏢 Función para dibujar el encabezado del establecimiento automáticamente
	const drawEstablishmentHeader = async (doc: jsPDF): Promise<number> => {
		// Si no hay datos del establecimiento o está deshabilitado, usar encabezado mínimo
		if (!establishmentData || !defaultHeaderConfig.showHeader) {
			return 20
		}

		const headerConfig = defaultHeaderConfig
		const pageWidth = doc.internal.pageSize.width
		let currentY = 15

		// Configurar colores y estilos
		doc.setFillColor(...headerConfig.backgroundColor)
		doc.setDrawColor(...headerConfig.borderColor)
		doc.setTextColor(...headerConfig.textColor)

		// Dibujar fondo del encabezado
		const headerHeight = 30
		doc.rect(10, 10, pageWidth - 20, headerHeight, 'FD')

		let logoWidth = 0
		// 🖼️ Agregar logo si está disponible y configurado
		if (headerConfig.showLogo && establishmentData.photo?.path) {
			try {
				const logoBase64 = await loadImageAsBase64(establishmentData.photo.path)
				if (logoBase64) {
					logoWidth = headerConfig.logoMaxWidth
					const logoHeight = headerConfig.logoMaxHeight
					doc.addImage(logoBase64, 'PNG', 15, 12, logoWidth, logoHeight)
				}
			} catch (error) {
				console.warn('Error cargando logo del establecimiento:', error)
			}
		}

		// 📋 Información de la empresa (lado derecho del logo)
		const textStartX = 20 + logoWidth
		currentY = 18

		if (headerConfig.showCompanyInfo) {
			// Nombre de la empresa
			doc.setFontSize(headerConfig.fontSize.companyName)
			doc.setFont('helvetica', 'bold')
			doc.text(establishmentData.companyName || 'Empresa', textStartX, currentY)
			currentY += 6

			// Nombre comercial (si es diferente)
			if (establishmentData.tradeName && establishmentData.tradeName !== establishmentData.companyName) {
				doc.setFontSize(headerConfig.fontSize.tradeName)
				doc.setFont('helvetica', 'normal')
				doc.text(`${establishmentData.tradeName}`, textStartX, currentY)
				currentY += 4
			}

			// RUC
			doc.setFontSize(headerConfig.fontSize.details)
			doc.setFont('helvetica', 'normal')
			doc.text(`RUC: ${establishmentData.ruc || 'N/A'}`, textStartX, currentY)

			// 📊 Información adicional en dos columnas
			const detailsStartY = currentY + 4
			let leftColumnY = detailsStartY
			const rightColumnY = detailsStartY

			// Columna izquierda
			if (establishmentData.issuingEstablishmentCode) {
				doc.text(
					`Est: ${establishmentData.issuingEstablishmentCode.toString().padStart(3, '0')}`,
					textStartX,
					leftColumnY
				)
				leftColumnY += 3
			}
			if (establishmentData.issuingPointCode) {
				doc.text(`Pto: ${establishmentData.issuingPointCode.toString().padStart(3, '0')}`, textStartX, leftColumnY)
				leftColumnY += 3
			}

			currentY = Math.max(leftColumnY, rightColumnY)
		}

		// 📅 Información de fecha del reporte (esquina superior derecha)
		doc.setFontSize(8)
		doc.setFont('helvetica', 'normal')
		doc.setTextColor(100, 100, 100)
		const reportDate = new Date().toLocaleString('es-ES', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		})
		doc.text(`Generado: ${reportDate}`, pageWidth - 15, 15, { align: 'right' })

		// Restablecer color de texto
		doc.setTextColor(...headerConfig.textColor)

		return Math.max(currentY + 10, 55) // Retornar la posición Y donde debe comenzar el contenido
	}

	// Función principal para exportar datos
	const exportData = async (data: any[], format: 'xlsx' | 'pdf', selectedColumns?: string[]) => {
		if (!data?.length) return

		// Transformar datos si se especificó una función
		const processedData = transformData ? transformData(data) : data

		// Limpiar y preformatear datos
		let cleanData = processedData.map(item => {
			const cleaned: Record<string, any> = {}
			Object.entries(item).forEach(([key, value]) => {
				if (!excludeColumns.includes(key)) cleaned[key] = preFormatValue(key, value)
			})
			return cleaned
		})

		// Agrupar columnas de fecha si está configurado
		if (pdfConfig.groupDateAtColumns) {
			cleanData = cleanData.map(item => groupDateAtColumns(item))
		}

		// Filtrar columnas seleccionadas
		const filteredData = selectedColumns?.length
			? cleanData.map(item => {
					const filtered: Record<string, any> = {}
					selectedColumns.forEach(col => {
						if (col in item) filtered[col] = item[col]
					})
					return filtered
				})
			: cleanData

		if (format === 'xlsx') {
			await exportExcel(filteredData)
		} else if (format === 'pdf') {
			await exportPDF(filteredData)
		}
	}

	// Preformatear valores según su tipo
	const preFormatValue = (key: string, value: any): any => {
		if (value === null || value === undefined) return ''

		const mapping = columnMappings[key]

		// Manejar imágenes - CORRECCIÓN PRINCIPAL
		if (mapping?.type === 'image') {
			// Si es un objeto con propiedades de imagen
			if (value && typeof value === 'object') {
				// Intentar extraer la URL de diferentes propiedades posibles
				const imageUrl = value.url || value.src || value.path || value.href
				if (imageUrl && typeof imageUrl === 'string') {
					return imageUrl
				}
				// Si no tiene URL válida, devolver texto indicativo
				return 'Imagen disponible'
			}
			// Si ya es una string (URL), devolverla tal como está
			if (typeof value === 'string') {
				return value
			}
			// Si no es válida, devolver texto por defecto
			return 'Sin imagen'
		}

		// Manejar contenido que ya viene preformateado
		if (typeof value === 'string' && value.includes('\n')) return value

		// Aplicar formato especial para texto largo
		if (mapping?.type === 'longtext' || (typeof value === 'string' && value.length > 150)) {
			const options = {
				...defaultTextOptions,
				...(mapping?.textOptions || {}),
			}
			return formatAsParagraph(String(value), options.maxCharsPerLine, options.lineHeight)
		}

		return value
	}

	// Formatear texto largo en párrafos con saltos de línea
	const formatAsParagraph = (text: string, maxChars: number): string => {
		if (!text || text.length <= maxChars) return text

		const words = text.split(' ')
		let currentLine = ''
		let result = ''

		words.forEach(word => {
			if ((currentLine + word).length > maxChars) {
				result += currentLine + '\n'
				currentLine = word + ' '
			} else {
				currentLine += word + ' '
			}
		})

		result += currentLine

		return result.trim()
	}

	// Agrupar columnas de fecha que terminan en "At"
	const groupDateAtColumns = (item: Record<string, any>): Record<string, any> => {
		const grouped: Record<string, any> = {}
		const dateLabels: string[] = []
		let hasDates = false

		Object.entries(item).forEach(([key, value]) => {
			if (key.toLowerCase().endsWith('at') && value) {
				hasDates = true
				const labelName = columnLabels[key] || formatColumnName(key.replace(/At$/i, ''))
				const formattedValue = formatDate(value)
				dateLabels.push(`${labelName}: ${formattedValue}`)
			} else {
				grouped[key] = value
			}
		})

		if (hasDates) {
			grouped['datesGroup'] = dateLabels.join('\n')
			if (!columnMappings['datesGroup']) {
				columnMappings['datesGroup'] = {
					type: 'date',
					wrapText: true,
					textOptions: {
						lineHeight: 1.0,
						fontSize: 9,
					},
				}
			}
			if (!columnLabels['datesGroup']) columnLabels['datesGroup'] = 'Fechas'
		}

		return grouped
	}

	// 📄 Exportar a PDF con encabezado automático del establecimiento
	const exportPDF = useCallback(
		async (items: any[]) => {
			if (!items.length) return

			const doc = new jsPDF({
				orientation: pdfConfig.orientation || 'landscape',
				unit: 'mm',
			})

			const headerColor = pdfConfig.headerColor || [22, 160, 133]
			const baseFontSize = pdfConfig.fontSize || 7

			// 🏢 Dibujar encabezado del establecimiento automáticamente
			const startY = await drawEstablishmentHeader(doc)

			// Título del reporte
			doc.setFontSize(baseFontSize + 10)
			doc.setTextColor(40, 40, 40)
			doc.setFont('helvetica', 'bold')
			doc.text(reportTitle, doc.internal.pageSize.width / 25, startY + 0, { align: 'left' })

			const headers = Object.keys(items[0]).map(col => columnLabels[col] || formatColumnName(col))

			const body = await Promise.all(
				items.map(async item =>
					Promise.all(
						Object.entries(item).map(async ([key, value]) => {
							const mapping = columnMappings[key]
							if (mapping?.type === 'image') {
								let imageUrl = null

								// Manejar diferentes tipos de objetos de imagen - CORRECCIÓN
								if (typeof value === 'string' && /\.(jpg|jpeg|png|gif)$/i.test(value)) {
									imageUrl = value
								} else if (value && typeof value === 'object') {
									// Intentar extraer URL de diferentes propiedades
									imageUrl = value.url || value.src || value.path || value.href
								}

								if (imageUrl && typeof imageUrl === 'string') {
									try {
										const base64 = await loadImageAsBase64(imageUrl)
										return { isImage: true, base64 }
									} catch (error) {
										console.warn('Error cargando imagen:', error)
										return 'Imagen no disponible'
									}
								}
								return 'Sin imagen'
							}
							return formatValueAdvanced(key, value) || ''
						})
					)
				)
			)

			const columns = Object.keys(items[0])
			const columnStyles: Record<string, any> = {}
			columns.forEach((col, index) => {
				const mapping = columnMappings[col] || {}
				columnStyles[index] = {
					cellWidth: mapping.type === 'image' ? 20 : mapping.maxWidth || 'auto',
					valign: 'middle',
					halign: mapping.type === 'number' || mapping.type === 'currency' ? 'right' : 'left',
				}
			})

			autoTable(doc, {
				head: [headers],
				body,
				startY: startY + 10,
				margin: { top: 20, bottom: 20, left: 10, right: 10 },
				columnStyles,
				styles: {
					cellPadding: defaultTableStyle.cellPadding,
					fontSize: baseFontSize - 1,
					valign: 'middle',
					halign: 'left',
					lineWidth: defaultTableStyle.lineWidth,
					lineColor: defaultTableStyle.lineColor,
				},
				headStyles: {
					fillColor: headerColor,
					textColor: 255,
					fontStyle: 'normal',
					fontSize: baseFontSize,
				},
				alternateRowStyles: {
					fillColor: defaultTableStyle.alternateFillColor,
				},
				didDrawCell: data => {
					if (data.section === 'body') {
						const cellValue = data.cell.raw as any
						if (cellValue?.isImage && cellValue.base64) {
							const imgX = data.cell.x + 2
							const imgY = data.cell.y + 2
							const imgWidth = data.cell.width - 4
							const imgHeight = data.cell.height - 4
							doc.addImage(cellValue.base64, 'JPEG', imgX, imgY, imgWidth, imgHeight)
						}
					}
				},
			})

			doc.save(`${fileName}_${formattedDateTime}.pdf`)
		},
		[fileName, reportTitle, columnMappings, columnLabels, pdfConfig, establishmentData]
	)

	// Función avanzada de formateo de valores
	const formatValueAdvanced = (key: string, value: any): string => {
		if (value === null || value === undefined) return ''

		const mapping = columnMappings[key]

		// Si el valor ya está preformateado (contiene saltos de línea)
		if (typeof value === 'string' && value.includes('\n')) return value

		if (mapping) {
			// Mapeo de valores personalizado
			if (mapping.valueMap && value in mapping.valueMap) return mapping.valueMap[value]

			// Función de formato personalizada
			if (mapping.format) return mapping.format(value)

			// Formateo según tipo de columna
			switch (mapping.type) {
				case 'image':
					// Manejar objetos de imagen - CORRECCIÓN
					if (value && typeof value === 'object') {
						const imageUrl = value.url || value.src || value.path || value.href
						return imageUrl && typeof imageUrl === 'string' ? imageUrl : 'Imagen disponible'
					}
					return typeof value === 'string' ? value : 'Sin imagen'
				case 'longtext':
					const options = {
						...defaultTextOptions,
						...(mapping.textOptions || {}),
					}
					return formatAsParagraph(String(value), options.maxCharsPerLine, options.lineHeight)
				case 'enum':
				case 'status':
					return mapEnumValue(key, value)
				case 'boolean':
					return value ? 'Activo' : 'Inactivo'
				case 'date':
					return formatDate(value)
				case 'currency':
					return formatCurrency(value)
				case 'email':
					return formatEmail(value)
				case 'phone':
					return formatPhoneNumber(value)
				default:
					return String(value)
			}
		}

		// Fallback a función personalizada del usuario
		if (formatValue) return formatValue(key, value)

		// Formateo por defecto basado en el tipo de dato
		return defaultFormatValue(key, value)
	}

	// Mapeo de valores de enumeración comunes
	const mapEnumValue = (key: string, value: any): string => {
		const commonMappings: Record<string, Record<any, string>> = {
			status: {
				ACTIVE: 'Activo',
				INACTIVE: 'Inactivo',
				PENDING: 'Pendiente',
				SUSPENDED: 'Suspendido',
				ARCHIVED: 'Archivado',
				DRAFT: 'Borrador',
				PUBLISHED: 'Publicado',
				active: 'Activo',
				inactive: 'Inactivo',
				pending: 'Pendiente',
				suspended: 'Suspendido',
				true: 'Activo',
				false: 'Inactivo',
				1: 'Activo',
				0: 'Inactivo',
			},
			priority: {
				HIGH: 'Alta',
				MEDIUM: 'Media',
				LOW: 'Baja',
				high: 'Alta',
				medium: 'Media',
				low: 'Baja',
			},
			type: {
				PERSONAL: 'Personal',
				BUSINESS: 'Empresarial',
				personal: 'Personal',
				business: 'Empresarial',
			},
		}

		const keyMapping = commonMappings[key.toLowerCase()]
		return keyMapping?.[value] || String(value)
	}

	// Formatear moneda
	const formatCurrency = (value: any): string => {
		const num = parseFloat(value)
		return isNaN(num) ? String(value) : formatPrice(num)
	}

	// Formatear email
	const formatEmail = (value: any): string => {
		if (typeof value !== 'string') return String(value)
		return value.toLowerCase().trim()
	}

	// Formatear número de teléfono
	const formatPhoneNumber = (value: any): string => {
		if (typeof value !== 'string') return String(value)

		// Eliminar todo excepto dígitos
		const digits = value.replace(/\D/g, '')

		// Formatear números internacionales
		if (digits.length > 10) return `+${digits.slice(0, digits.length - 10)} ${digits.slice(-10)}`

		// Formatear números locales
		return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
	}

	// Exportar a Excel con formato optimizado
	const exportExcel = async (items: any[]) => {
		if (!items.length) return

		const data = items.map(item => {
			const obj: Record<string, any> = {}
			Object.entries(item).forEach(([key, value]) => {
				const label = columnLabels[key] || formatColumnName(key)
				// Para Excel, simplificar el formato de texto largo
				const formattedValue =
					typeof value === 'string' && value.includes('\n')
						? value.replace(/\n/g, ' ') // Reemplazar saltos con espacios
						: formatValueAdvanced(key, value)
				obj[label] = formattedValue
			})
			return obj
		})

		const worksheet = utils.json_to_sheet(data)

		// Ajustar anchos de columna automáticamente
		const colWidths = Object.keys(items[0]).map(key => {
			const label = columnLabels[key] || formatColumnName(key)
			const maxLength = Math.max(
				...data.map(row => {
					const value = row[label]
					return value ? String(value).length : 0
				}),
				label.length
			)
			return { wch: Math.min(Math.max(maxLength, 10), 50) } // Mínimo 10, máximo 50
		})

		worksheet['!cols'] = colWidths

		// Agregar filtros a la primera fila
		worksheet['!autofilter'] = { ref: `A1:${String.fromCharCode(65 + colWidths.length - 1)}1` }

		const workbook = utils.book_new()
		utils.book_append_sheet(workbook, worksheet, reportTitle.substring(0, 31)) // Limitar a 31 caracteres
		writeFile(workbook, `${fileName}_${formattedDateTime}.xlsx`)
	}

	// Formatear nombres de columnas para mostrarse mejor
	const formatColumnName = (str: string): string => {
		return str
			.replace(/([A-Z])/g, ' $1')
			.replace(/_/g, ' ')
			.replace(/At$/i, '')
			.replace(/(^|\s)\S/g, firstChar => firstChar.toUpperCase())
			.trim()
	}

	// Formateo por defecto para valores sin configuración específica
	const defaultFormatValue = (key: string, value: any): string => {
		if (value === null || value === undefined) return ''

		// Manejar objetos (como imágenes) que no tienen configuración específica
		if (typeof value === 'object' && value !== null) {
			// Si es un objeto de imagen sin configuración
			if (value.url || value.src || value.path || value.href) {
				const imageUrl = value.url || value.src || value.path || value.href
				return typeof imageUrl === 'string' ? imageUrl : 'Imagen disponible'
			}
			return String(value)
		}

		// Booleanos
		if (typeof value === 'boolean') return value ? 'Activo' : 'Inactivo'

		// Fechas
		if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) return formatDate(value)

		// Estados comunes
		if (key === 'status') return mapEnumValue('status', value)

		// Números
		if (typeof value === 'number') {
			return key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')
				? formatCurrency(value)
				: String(value)
		}

		// Texto largo
		if (typeof value === 'string' && value.length > 100) return formatAsParagraph(value, 100, 1.2)

		return String(value)
	}

	// Obtener información de tipos de columna
	const getColumnTypeInfo = () => {
		const typeInfo: Record<string, { type: ColumnType; options?: string[] }> = {}

		Object.entries(columnMappings).forEach(([key, mapping]) => {
			typeInfo[key] = {
				type: mapping.type,
				options: mapping.valueMap ? Object.values(mapping.valueMap) : undefined,
			}
		})

		return typeInfo
	}

	return {
		exportData,
		getColumnTypeInfo,
		columnLabels,
		excludeColumns,
		establishmentData,
		isLoadingEstablishment,
	}
}
