import * as XLSX from 'xlsx'
import { DataSource } from 'typeorm'
import { Injectable, BadRequestException } from '@nestjs/common'

import { ALLOW_TAX, ProductStatus } from '@/modules/product/status.enum'
import { CategoryStatus } from '@/modules/categories/category-status.enum'
import { SupplierStatus } from '@/modules/suppliers/status.enum'
import { ProductRepository } from '@/modules/product/infrastructure/persistence/product.repository'
import { CategoryRepository } from '@/modules/categories/infrastructure/persistence/category.repository'
import { SupplierRepository } from '@/modules/suppliers/infrastructure/persistence/supplier.repository'
import { KardexRepository } from '@/modules/kardex/infrastructure/persistence/kardex.repository'
import {
  BulkProductImportDto,
  BulkProductImportItemDto,
  BulkImportResultDto,
  BulkImportValidationDto,
} from '@/modules/product/dto/import.dto'
import { Product } from '@/modules/product/domain/product'
import { Category } from '@/modules/categories/domain/category'
import { Brand } from '@/modules/brand/domain/brand'
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { KardexMovementType } from '../kardex/movement-type.enum'
import { User } from '../users/domain/user'
import { Kardex } from '../kardex/domain/kardex'

interface ProductImportResult {
  success: boolean
  productName: string
  message: string
  isUpdate?: boolean
}

@Injectable()
export class BulkProductImportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly supplierRepository: SupplierRepository,
    private readonly kardexRepository: KardexRepository,
  ) {}

  /**
   * Importa productos masivamente desde un DTO
   */
  async importProducts(
    importDto: BulkProductImportDto,
    userId: string,
  ): Promise<BulkImportResultDto> {
    const results: ProductImportResult[] = []
    let processedCount = 0

    // Cache para categorías y proveedores ya resueltos
    const categoryCache = new Map<string, string>()
    const supplierCache = new Map<string, string>()

    return await this.dataSource.transaction(async (entityManager) => {
      const newProducts: Partial<Product>[] = []
      const kardexEntries: Partial<Kardex>[] = []
      const pendingResults: {
        data: BulkProductImportItemDto
        result: Omit<ProductImportResult, 'productName' | 'message'>
        initialStock?: number
        costPrice?: number
        taxPercent?: number
      }[] = []

      // PRIMERO: Pre-resolver todas las categorías y proveedores únicos
      const uniqueCategories = new Set<string>()
      const uniqueSuppliers = new Set<string>()

      // Recopilar todas las categorías y proveedores únicos
      for (const productData of importDto.products) {
        if (productData.category?.trim()) {
          uniqueCategories.add(productData.category.trim())
        }
        if (productData.legalName?.trim()) {
          uniqueSuppliers.add(productData.legalName.trim())
        }
      }

      // Resolver categorías únicas
      for (const categoryName of uniqueCategories) {
        try {
          const categoryId = await this.findOrCreateCategory(
            categoryName,
            entityManager,
          )
          categoryCache.set(categoryName, categoryId)
        } catch (error) {
          console.error(`Error resolviendo categoría "${categoryName}":`, error)
          // Si falla una categoría, usar la por defecto si existe
          if (importDto.categoryId) {
            categoryCache.set(categoryName, importDto.categoryId)
          } else {
            throw new BadRequestException(
              `No se pudo procesar la categoría "${categoryName}" y no hay categoría por defecto configurada`,
            )
          }
        }
      }

      // Resolver proveedores únicos
      for (const supplierName of uniqueSuppliers) {
        try {
          const supplierId = await this.findOrCreateSupplier(
            supplierName,
            entityManager,
          )
          supplierCache.set(supplierName, supplierId)
        } catch (error) {
          console.error(`Error resolviendo proveedor "${supplierName}":`, error)
          // Si falla un proveedor, usar el por defecto si existe
          if (importDto.supplierId) {
            supplierCache.set(supplierName, importDto.supplierId)
          }
          // Los proveedores son opcionales, no lanzamos error
        }
      }

      // SEGUNDO: Procesar cada producto con las relaciones ya resueltas
      for (const [index, productData] of importDto.products.entries()) {
        processedCount++

        try {
          // Validaciones básicas
          if (!productData.itemName?.trim()) {
            throw new BadRequestException(
              'El nombre del producto es obligatorio',
            )
          }

          // Resolver relaciones desde el cache
          const resolvedIds = await this.resolveRelationshipsFromCache(
            productData,
            importDto,
            categoryCache,
            supplierCache,
          )

          const existingProduct = await this.findExistingProduct(productData)

          // Validación de impuesto permitido
          const taxValue = Number(productData.taxPercent)
          if (
            taxValue !== ALLOW_TAX.WITH_TAX &&
            taxValue !== ALLOW_TAX.EXEMPT_IVA
          ) {
            throw new BadRequestException(
              `Valor de impuesto inválido en fila ${index + 2}. Solo se permite ${ALLOW_TAX.WITH_TAX} (Con IVA) o ${ALLOW_TAX.EXEMPT_IVA} (Exento de IVA).`,
            )
          }

          const productEntity: Partial<Product> = {
            ...(existingProduct || {}),
            name: productData.itemName.trim(),
            price: Number(productData.costPrice),
            pricePublic: Number(productData.unitPrice),
            status: productData.status || ProductStatus.ACTIVE,
            sku: productData.sku?.trim() || existingProduct?.sku,
            barCode:
              productData.barcode?.trim() || existingProduct?.barCode || null,
            stock: Number(productData.locationStock || 0),
            tax: Number(productData.taxPercent || 0),
            isVariant: false,

            // Relaciones como objetos con id
            category: resolvedIds.categoryId
              ? ({ id: resolvedIds.categoryId } as Category)
              : null,
            brand: resolvedIds.brandId
              ? ({ id: resolvedIds.brandId } as Brand)
              : null,
            supplier: resolvedIds.supplierId
              ? ({ id: resolvedIds.supplierId } as Supplier)
              : null,
          }

          if (existingProduct && importDto.updateExisting) {
            const updated = await this.productRepository.update(
              existingProduct.id,
              productEntity,
              entityManager,
            )
            results.push({
              success: true,
              productName: updated.name,
              message: `Producto actualizado: ${updated.name} (Código: ${updated.code})`,
              isUpdate: true,
            })
          } else if (!existingProduct) {
            newProducts.push(productEntity)
            pendingResults.push({
              data: productData,
              result: { success: true, isUpdate: false },
              initialStock: Number(productData.locationStock || 0),
              costPrice: productData.costPrice,
              taxPercent: productData.taxPercent,
            })
          } else {
            // Producto existe pero no se permite actualizar
            results.push({
              success: false,
              productName: productData.itemName,
              message: `Producto ya existe: ${productData.itemName} (Identificación: ${productData.sku})`,
            })
          }
        } catch (error) {
          const errorResult: ProductImportResult = {
            success: false,
            productName: productData.itemName || `Fila ${index + 1}`,
            message: `Error en fila ${index + 2}: ${error.message}`,
          }
          results.push(errorResult)

          if (!importDto.continueOnError) {
            throw new BadRequestException(
              `Importación detenida en fila ${index + 2}: ${error.message}`,
            )
          }
        }
      }

      // Guardar en lote los nuevos productos
      if (newProducts.length > 0) {
        const savedProducts = await this.productRepository.bulkCreate(
          newProducts,
          entityManager,
        )

        // Crear entradas de Kardex para productos nuevos con stock
        savedProducts.forEach((product, index) => {
          const pendingResult = pendingResults[index]
          if (
            pendingResult &&
            pendingResult.initialStock !== undefined &&
            pendingResult.initialStock > 0
          ) {
            const initialStock = pendingResult.initialStock
            const unitCost = pendingResult.costPrice || product.price || 0
            const subtotal = unitCost * initialStock
            const taxRate = pendingResult.taxPercent || 0
            const taxAmount = subtotal * (taxRate / 100)
            const total = subtotal + taxAmount

            kardexEntries.push({
              product,
              user: { id: userId } as User,
              movementType: KardexMovementType.PURCHASE,
              quantity: initialStock,
              unitCost,
              subtotal,
              taxRate,
              taxAmount,
              total,
              stockBefore: 0,
              stockAfter: initialStock,
              reason: 'Stock inicial desde importación masiva',
              createdAt: new Date(),
            })
          }
        })

        // Guardar entradas de Kardex en lote
        if (kardexEntries.length > 0) {
          await this.kardexRepository.bulkCreate(kardexEntries, entityManager)
        }

        savedProducts.forEach((prod, i) => {
          results.push({
            ...pendingResults[i].result,
            productName: prod.name,
            message: `Producto creado: ${prod.name} (Código: ${prod.code})`,
          })
        })
      }

      // Compilar resultados
      const successResults = results.filter((r) => r.success)
      const errorResults = results.filter((r) => !r.success)
      const createdCount = successResults.filter((r) => !r.isUpdate).length
      const updatedCount = successResults.filter((r) => r.isUpdate).length

      return {
        successCount: successResults.length,
        errorCount: errorResults.length,
        successMessages: successResults.map((r) => r.message),
        errorMessages: errorResults.map((r) => r.message),
        totalProcessed: processedCount,
        createdCount,
        updatedCount,
        kardexEntriesCreated: kardexEntries.length,
      } as BulkImportResultDto
    })
  }

  /**
   * Resuelve los IDs de las relaciones - BUSCA EXISTENTES O CREA NUEVOS
   * Ahora maneja los errores de transacción correctamente
   */
  private async resolveRelationshipsFromCache(
    productData: BulkProductImportItemDto,
    importDto: BulkProductImportDto,
    categoryCache: Map<string, string>,
    supplierCache: Map<string, string>,
  ): Promise<{
    categoryId?: string
    brandId?: string
    supplierId?: string
  }> {
    const resolved: {
      categoryId?: string
      brandId?: string
      supplierId?: string
    } = {}

    // === RESOLVER CATEGORÍA ===
    if (productData.category?.trim()) {
      const categoryName = productData.category.trim()
      resolved.categoryId = categoryCache.get(categoryName)

      if (!resolved.categoryId && importDto.categoryId) {
        resolved.categoryId = importDto.categoryId
      }
    } else if (importDto.categoryId) {
      resolved.categoryId = importDto.categoryId
    }

    // === RESOLVER PROVEEDOR ===
    if (productData.legalName?.trim()) {
      const supplierName = productData.legalName.trim()
      resolved.supplierId = supplierCache.get(supplierName)

      if (!resolved.supplierId && importDto.supplierId) {
        resolved.supplierId = importDto.supplierId
      }
    } else if (importDto.supplierId) {
      resolved.supplierId = importDto.supplierId
    }

    // === RESOLVER MARCA ===
    resolved.brandId = productData.brandId || importDto.brandId

    return resolved
  }

  /**
   * Busca o crea una categoría usando SAVEPOINT para manejar errores de transacción
   */
  private async findOrCreateCategory(
    categoryName: string,
    entityManager: any,
  ): Promise<string> {
    // 1. Buscar si ya existe
    const category = await this.categoryRepository.findByField(
      'name',
      categoryName,
    )

    if (category) {
      return category.id
    }

    // 2. Crear nueva categoría
    const newCategoryData = {
      name: categoryName,
      status: CategoryStatus.ACTIVE,
      description: `Categoría creada automáticamente desde importación masiva`,
    }

    const createdCategory = await this.categoryRepository.create(
      newCategoryData,
      entityManager,
    )

    return createdCategory.id
  }

  /**
   * Busca o crea un proveedor usando SAVEPOINT para manejar errores de transacción
   */
  /**
   * Busca o crea un proveedor usando SAVEPOINT para manejar errores de transacción
   */
  private async findOrCreateSupplier(
    legalName: string,
    entityManager: any,
  ): Promise<string> {
    // 1. Buscar si ya existe por nombre legal
    const supplier = await this.supplierRepository.findByField(
      'legalName',
      legalName,
    )

    if (supplier) {
      return supplier.id
    }

    // 2. Generar RUC ecuatoriano válido
    const ruc = this.generateEcuadorianRUC()

    // 3. Crear nuevo proveedor
    const newSupplierData = {
      ruc: ruc,
      legalName: legalName,
      commercialName: legalName,
      status: SupplierStatus.ACTIVE,
    }

    const createdSupplier = await this.supplierRepository.create(
      newSupplierData,
      entityManager,
    )

    return createdSupplier.id
  }

  /**
   * Genera un RUC ecuatoriano válido
   * Estructura del RUC: 0XXXXXXXXXXX (13 dígitos)
   * - Primer dígito: 0 para personas naturales, 1-9 para empresas
   * - Siguientes 9 dígitos: número de cédula o identificación
   * - Últimos 3 dígitos: 001 para comerciantes individuales
   */
  private generateEcuadorianRUC(): string {
    // Persona natural (0) o empresa (1-9)
    const tipoEmpresa = Math.floor(Math.random() * 10) // 0-9

    // Generar 9 dígitos aleatorios para la identificación
    let identificacion = ''
    for (let i = 0; i < 9; i++) {
      identificacion += Math.floor(Math.random() * 10)
    }

    // Últimos 3 dígitos (001 para comerciantes individuales)
    const establecimiento = '001'

    // Construir RUC completo
    const ruc = `${tipoEmpresa}${identificacion}${establecimiento}`

    // Validar que el RUC cumple con el algoritmo de verificación
    return this.validateRUC(ruc) ? ruc : this.generateEcuadorianRUC()
  }

  /**
   * Valida un RUC ecuatoriano usando el algoritmo de verificación
   */
  private validateRUC(ruc: string): boolean {
    // Debe tener exactamente 13 dígitos
    if (!/^\d{13}$/.test(ruc)) {
      return false
    }

    // Los dos últimos dígitos deben ser 001 para este caso
    if (ruc.substring(10, 13) !== '001') {
      return false
    }

    // Algoritmo de validación de cédula/RUC ecuatoriano
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    const digits = ruc.substring(0, 9).split('').map(Number)
    let total = 0

    for (let i = 0; i < coefficients.length; i++) {
      let product = digits[i] * coefficients[i]
      if (product > 9) {
        product -= 9
      }
      total += product
    }

    const checkDigit = total % 10 === 0 ? 0 : 10 - (total % 10)
    const providedCheckDigit = parseInt(ruc[9], 10)

    return checkDigit === providedCheckDigit
  }

  /**
   * Busca un producto existente por SKU
   */
  private async findExistingProduct(productData: BulkProductImportItemDto) {
    if (productData.sku?.trim()) {
      const bySku = await this.productRepository.findByField(
        'sku',
        productData.sku.trim(),
      )
      if (bySku) return bySku
    }

    return null
  }

  /**
   * Parsea un archivo Excel y lo convierte en BulkProductImportDto
   */
  async parseExcelToImportDto(
    excelBuffer: Buffer,
    options: {
      continueOnError?: boolean
      updateExisting?: boolean
      categoryId?: string
      brandId?: string
      supplierId?: string
    } = {},
  ): Promise<BulkProductImportDto> {
    try {
      const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]

      if (!sheetName) {
        throw new BadRequestException(
          'El archivo Excel no contiene hojas de trabajo',
        )
      }

      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length === 0)
        throw new BadRequestException('El archivo Excel está vacío')

      // Obtener headers (primera fila)
      const headers = jsonData[0] as string[]

      // Headers esperados exactos
      const expectedHeaders = [
        'Identificación',
        'UPC/EAN/ISBN',
        'Nombre Artículo',
        'Categoría',
        'Nombre de la Compañia',
        'Precio al Por Mayor',
        'Precio de Venta',
        'Cantidad en Stock',
        'Porcentaje de Impuesto(s)',
        'Avatar',
      ]

      // Validar que los headers requeridos estén presentes
      const requiredHeaders = ['Nombre Artículo', 'Precio de Venta']
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header),
      )

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Headers requeridos faltantes: ${missingHeaders.join(', ')}. Headers encontrados: ${headers.join(', ')}`,
        )
      }

      const products: BulkProductImportItemDto[] = []

      // Procesar cada fila de datos (saltando el header)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[]

        if (!row || row.length === 0 || row.every((cell) => !cell)) continue // Saltar filas vacías

        // Mapear solo los campos específicos del Excel
        const product: BulkProductImportItemDto = {
          sku: this.getExcelValue(row, headers, 'Identificación'),
          barcode: this.getExcelValue(row, headers, 'UPC/EAN/ISBN'),
          itemName: this.getExcelValue(row, headers, 'Nombre Artículo') || '',
          category: this.getExcelValue(row, headers, 'Categoría'),
          legalName: this.getExcelValue(row, headers, 'Nombre de la Compañia'),
          costPrice: this.parseNumber(
            this.getExcelValue(row, headers, 'Precio al Por Mayor'),
          ),
          unitPrice:
            this.parseNumber(
              this.getExcelValue(row, headers, 'Precio de Venta'),
            ) || 0,
          locationStock: this.parseInteger(
            this.getExcelValue(row, headers, 'Cantidad en Stock'),
          ),
          taxPercent: this.parseNumber(
            this.getExcelValue(row, headers, 'Porcentaje de Impuesto(s)'),
          ),
          avatar: this.getExcelValue(row, headers, 'Avatar'),
        }

        products.push(product)
      }

      return {
        products,
        continueOnError: options.continueOnError || false,
        updateExisting: options.updateExisting || false,
        categoryId: options.categoryId,
        brandId: options.brandId,
        supplierId: options.supplierId,
      }
    } catch (error) {
      throw new BadRequestException(
        `Error procesando archivo Excel: ${error.message}`,
      )
    }
  }

  /**
   * Obtiene un valor de una celda Excel por nombre de columna
   */
  private getExcelValue(
    row: any[],
    headers: string[],
    headerName: string,
  ): string | undefined {
    const index = headers.indexOf(headerName)
    if (index === -1 || index >= row.length) return undefined

    const value = row[index]
    if (value === null || value === undefined || value === '') return undefined

    return String(value).trim()
  }

  /**
   * Parsea un valor a número
   */
  private parseNumber(value: string | undefined): number | undefined {
    if (!value || value.trim() === '') return undefined
    const num = parseFloat(String(value).replace(/,/g, ''))
    return isNaN(num) ? undefined : num
  }

  /**
   * Parsea un valor a entero
   */
  private parseInteger(value: string | undefined): number | undefined {
    if (!value || value.trim() === '') return undefined
    const num = parseInt(String(value).replace(/,/g, ''), 10)
    return isNaN(num) ? undefined : num
  }

  /**
   * Valida el formato y contenido del Excel antes de procesar
   */
  async validateExcelStructure(
    excelBuffer: Buffer,
  ): Promise<BulkImportValidationDto> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const workbook = XLSX.read(excelBuffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]

      if (!sheetName) {
        errors.push('El archivo Excel no contiene hojas de trabajo')
        return { isValid: false, errors, warnings, totalRows: 0 }
      }

      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      const totalRows = jsonData.length - 1 // Excluyendo header

      if (jsonData.length === 0) {
        errors.push('El archivo Excel está vacío')
        return { isValid: false, errors, warnings, totalRows: 0 }
      }

      if (jsonData.length === 1) {
        errors.push(
          'El archivo Excel solo contiene headers, no hay datos para procesar',
        )
        return { isValid: false, errors, warnings, totalRows: 0 }
      }

      // Validar headers
      const headers = jsonData[0] as string[]
      const requiredHeaders = ['Nombre Artículo', 'Precio de Venta']
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header),
      )

      if (missingHeaders.length > 0) {
        errors.push(
          `Headers requeridos faltantes: ${missingHeaders.join(', ')}`,
        )
      }

      // Validar estructura de headers esperados
      const expectedHeaders = [
        'Identificación',
        'UPC/EAN/ISBN',
        'Nombre Artículo',
        'Categoría',
        'Nombre de la Compañia',
        'Precio al Por Mayor',
        'Precio de Venta',
        'Cantidad en Stock',
        'Porcentaje de Impuesto(s)',
        'Avatar',
      ]

      const unexpectedHeaders = headers.filter(
        (h) => !expectedHeaders.includes(h),
      )
      if (unexpectedHeaders.length > 0) {
        warnings.push(
          `Headers no reconocidos (serán ignorados): ${unexpectedHeaders.join(', ')}`,
        )
      }

      // Validar cada fila de datos (validar solo las primeras 100 filas para performance)
      for (let i = 1; i < Math.min(jsonData.length, 101); i++) {
        const row = jsonData[i] as any[]

        if (!row || row.length === 0 || row.every((cell) => !cell)) {
          continue // Saltar filas vacías
        }

        // Validar que tenga nombre de producto
        const itemName = this.getExcelValue(row, headers, 'Nombre Artículo')
        if (!itemName || itemName.trim() === '') {
          errors.push(`Fila ${i + 1}: Nombre del producto es obligatorio`)
        }

        // Validar que tenga precio válido
        const unitPrice = this.getExcelValue(row, headers, 'Precio de Venta')
        const parsedPrice = this.parseNumber(unitPrice)
        if (!parsedPrice || parsedPrice <= 0) {
          errors.push(
            `Fila ${i + 1}: Precio de venta debe ser un número mayor a 0`,
          )
        }

        // Advertencias para campos opcionales pero recomendados
        const category = this.getExcelValue(row, headers, 'Categoría')
        if (!category || category.trim() === '') {
          warnings.push(
            `Fila ${i + 1}: Se recomienda especificar una categoría`,
          )
        }

        const stock = this.getExcelValue(row, headers, 'Cantidad en Stock')
        if (!stock || stock.trim() === '') {
          warnings.push(
            `Fila ${i + 1}: No se especificó cantidad en stock, se asignará 0`,
          )
        }

        const legalName = this.getExcelValue(
          row,
          headers,
          'Nombre de la Compañia',
        )
        if (!legalName || legalName.trim() === '') {
          warnings.push(
            `Fila ${i + 1}: Se recomienda especificar el nombre de la compañía`,
          )
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        totalRows,
      }
    } catch (error) {
      errors.push(`Error procesando archivo Excel: ${error.message}`)
      return { isValid: false, errors, warnings, totalRows: 0 }
    }
  }

  /**
   * Parsea el Excel y genera el preview con la estructura correcta
   */
  async parseExcelToPreviewData(fileBuffer: Buffer): Promise<any[]> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // Convertir a JSON manteniendo los nombres de las columnas originales
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Tomar solo las primeras 5 filas para el preview
      const previewData = jsonData.map((row: any) => {
        return {
          // Mantener los nombres originales en español para el frontend
          Identificación: row['Identificación'] || '',
          'UPC/EAN/ISBN': row['UPC/EAN/ISBN'] || '',
          'Nombre Artículo': row['Nombre Artículo'] || '',
          Categoría: row['Categoría'] || '',
          'Nombre de la Compañia': row['Nombre de la Compañia'] || '',
          'Precio al Por Mayor': row['Precio al Por Mayor'] || 0,
          'Precio de Venta': row['Precio de Venta'] || 0,
          'Cantidad en Stock': row['Cantidad en Stock'] || 0,
          'Porcentaje de Impuesto(s)': row['Porcentaje de Impuesto(s)'] || 0,
          Avatar: row['Avatar'] || '',
        }
      })

      return previewData
    } catch (error) {
      throw new Error(`Error parsing Excel for preview: ${error.message}`)
    }
  }

  /**
   * Genera un archivo Excel template con los headers específicos
   */
  async generateExcelTemplate(): Promise<Buffer> {
    try {
      // Headers exactos que esperas en tu Excel
      const headers = [
        'Identificación',
        'UPC/EAN/ISBN',
        'Nombre Artículo',
        'Categoría',
        'Nombre de la Compañia',
        'Precio al Por Mayor',
        'Precio de Venta',
        'Cantidad en Stock',
        'Porcentaje de Impuesto(s)',
        'Avatar',
      ]

      // Fila de ejemplo con datos de muestra
      const exampleRow = [
        'ITEM001',
        '7860001234567',
        'Camiseta Básica Algodón',
        'Ropa',
        'Textiles del Ecuador',
        '15.5',
        '29.99',
        '100',
        '15',
        'camiseta.jpg',
      ]

      // Crear un nuevo workbook
      const workbook = XLSX.utils.book_new()

      // Crear datos para la hoja (headers + ejemplo)
      const worksheetData = [headers, exampleRow]

      // Crear worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      // Agregar la hoja al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos')

      // Convertir a buffer
      const excelBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
      })

      return excelBuffer
    } catch (error) {
      throw new BadRequestException(
        `Error generando template Excel: ${error.message}`,
      )
    }
  }
}
