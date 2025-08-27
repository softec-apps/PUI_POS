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

      for (const [index, productData] of importDto.products.entries()) {
        processedCount++

        try {
          // Validaciones básicas
          if (!productData.itemName?.trim())
            throw new BadRequestException(
              'El nombre del producto es obligatorio',
            )

          if (!productData.unitPrice || productData.unitPrice <= 0)
            throw new BadRequestException(
              'El precio unitario debe ser mayor a 0',
            )

          const resolvedIds = await this.resolveRelationships(
            productData,
            importDto,
            entityManager,
          )

          const existingProduct = await this.findExistingProduct(productData)

          // Dentro del bucle que procesa los productos:
          const taxValue = Number(productData.taxPercent)

          // Validación de impuesto permitido
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
            price: Number(productData.unitPrice),
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
          // CORRECCIÓN: Validar que initialStock no sea undefined y sea mayor a 0
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
              // CORRECCIÓN: Crear objeto User con el id
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

        // Guardar entradas de Kardex en lote usando el método del repository
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
   * Resuelve los IDs de las relaciones (categoría, marca, proveedor)
   * Crea automáticamente si no existen - VERSIÓN CON RUC ÚNICO
   */
  private async resolveRelationships(
    productData: BulkProductImportItemDto,
    importDto: BulkProductImportDto,
    entityManager: any,
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

    // Resolver categoría por nombre (igual que antes)
    if (productData.category?.trim()) {
      try {
        const existingCategory = await this.categoryRepository.findByField(
          'name',
          productData.category.trim(),
        )

        if (existingCategory) {
          resolved.categoryId = existingCategory.id
        } else {
          try {
            const newCategory = await this.categoryRepository.create(
              {
                name: productData.category.trim(),
                description: `Categoría creada automáticamente durante importación`,
                photo: null,
                status: CategoryStatus.ACTIVE,
              },
              entityManager,
            )
            resolved.categoryId = newCategory.id
            console.log(
              `Categoría creada exitosamente con ID: ${newCategory.id}`,
            )
          } catch (createError) {
            console.log(`Error creando categoría: ${createError.message}`)
            resolved.categoryId = importDto.categoryId
          }
        }
      } catch (error) {
        console.log(`Error procesando categoría: ${error.message}`)
        resolved.categoryId = importDto.categoryId
      }
    } else {
      resolved.categoryId = importDto.categoryId
    }

    // Resolver proveedor por nombre de compañía - CON RUC ÚNICO
    if (productData.companyName?.trim()) {
      try {
        const existingSupplier = await this.supplierRepository.findByField(
          'legalName',
          productData.companyName.trim(),
        )

        if (existingSupplier) {
          resolved.supplierId = existingSupplier.id
        } else {
          // Buscar por nombre comercial también
          const existingByCommercial =
            await this.supplierRepository.findByField(
              'commercialName',
              productData.companyName.trim(),
            )

          if (existingByCommercial) {
            resolved.supplierId = existingByCommercial.id
          } else {
            // Generar RUC único en lugar de usar uno fijo
            const uniqueRuc = this.generateUniqueRuc()

            try {
              const newSupplier = await this.supplierRepository.create(
                {
                  ruc: uniqueRuc,
                  legalName: productData.companyName.trim(),
                  commercialName: productData.companyName.trim(),
                  status: SupplierStatus.ACTIVE,
                },
                entityManager,
              )
              resolved.supplierId = newSupplier.id
              console.log(
                `Proveedor creado exitosamente con ID: ${newSupplier.id} y RUC: ${uniqueRuc}`,
              )
            } catch (createError) {
              console.log(`Error creando proveedor: ${createError.message}`)
              // Si falla, intentar usar uno existente con nombre similar
              const similarSupplier = await this.findSimilarSupplier(
                productData.companyName.trim(),
              )
              if (similarSupplier) {
                resolved.supplierId = similarSupplier.id
              } else {
                resolved.supplierId = importDto.supplierId
              }
            }
          }
        }
      } catch (error) {
        console.log(`Error procesando proveedor: ${error.message}`)
        resolved.supplierId = importDto.supplierId
      }
    } else {
      resolved.supplierId = importDto.supplierId
    }

    // Usar brand por defecto si está disponible
    resolved.brandId = productData.brandId || importDto.brandId

    return resolved
  }

  /**
   * Genera un RUC único para nuevos proveedores
   */
  private generateUniqueRuc(): string {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
    // RUC ecuatoriano válido: 13 dígitos, empezando con 09 para personas jurídicas
    return `09${timestamp.slice(-9)}${random}`.slice(0, 13)
  }

  /**
   * Busca un proveedor con nombre similar
   */
  private async findSimilarSupplier(
    companyName: string,
  ): Promise<Supplier | null> {
    try {
      // Buscar proveedores que contengan el nombre
      const suppliers = await this.supplierRepository.findByField(
        'legalName',
        companyName,
      )
      return suppliers || null
    } catch (error) {
      console.log(`Error buscando proveedor similar: ${error.message}`)
      return null
    }
  }

  /**
   * Busca un producto existente por barcode o SKU
   */
  private async findExistingProduct(productData: BulkProductImportItemDto) {
    /*
    if (productData.barcode?.trim()) {
      const byBarcode = await this.productRepository.findByField(
        'barCode',
        productData.barcode.trim(),
      )
      if (byBarcode) return byBarcode
    }
    */

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
   * Solo maneja los 10 campos específicos del Excel
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

      if (jsonData.length === 0) {
        throw new BadRequestException('El archivo Excel está vacío')
      }

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

        if (!row || row.length === 0 || row.every((cell) => !cell)) {
          continue // Saltar filas vacías
        }

        // Mapear solo los campos específicos del Excel
        const product: BulkProductImportItemDto = {
          sku: this.getExcelValue(row, headers, 'Identificación'),
          barcode: this.getExcelValue(row, headers, 'UPC/EAN/ISBN'),
          itemName: this.getExcelValue(row, headers, 'Nombre Artículo') || '',
          category: this.getExcelValue(row, headers, 'Categoría'),
          companyName: this.getExcelValue(
            row,
            headers,
            'Nombre de la Compañia',
          ),
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

        const companyName = this.getExcelValue(
          row,
          headers,
          'Nombre de la Compañia',
        )
        if (!companyName || companyName.trim() === '') {
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
