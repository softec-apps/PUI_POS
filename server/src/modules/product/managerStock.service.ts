import { DataSource } from 'typeorm'
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'

import { Product } from '@/modules/product/domain/product'
import { ProductRepository } from '@/modules/product/infrastructure/persistence/product.repository'
import { UserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import { KardexRepository } from '@/modules/kardex/infrastructure/persistence/kardex.repository'
import { KardexMovementType } from '@/modules/kardex/movement-type.enum'
import { MESSAGE_RESPONSE } from '@/modules/product/messages/responseOperation.message'

// DTOs para el descuento de stock
export interface ProductStockDiscount {
  productId: string
  quantity: number
  reason?: string
  unitCost?: number
}

export interface StockDiscountResponse {
  productId: string
  productName: string
  stockBefore: number
  stockAfter: number
  quantityDiscounted: number
  success: boolean
  error?: string
}

export interface BulkStockDiscountResult {
  successful: StockDiscountResponse[]
  failed: StockDiscountResponse[]
  totalProcessed: number
  totalSuccessful: number
  totalFailed: number
}

@Injectable()
export class StockDiscountService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
    private readonly kardexRepository: KardexRepository,
  ) {}

  /**
   * Descuenta stock de un solo producto
   * @param productId ID del producto
   * @param quantity Cantidad a descontar
   * @param userId ID del usuario que realiza la operación
   * @param reason Razón del descuento (opcional)
   * @param unitCost Costo unitario (opcional, si no se proporciona usa el precio del producto)
   * @returns Promise<StockDiscountResponse>
   */
  async discountSingleProduct(
    productId: string,
    quantity: number,
    userId: string,
    reason: string = 'Descuento de stock',
    unitCost?: number,
  ): Promise<StockDiscountResponse> {
    return this.dataSource.transaction(async (entityManager) => {
      try {
        // Validar que la cantidad sea positiva
        if (quantity <= 0) {
          throw new ConflictException('La cantidad debe ser mayor a 0')
        }

        // Buscar el producto
        const product = await this.productRepository.findById(productId)
        if (!product) {
          throw new NotFoundException(MESSAGE_RESPONSE.NOT_FOUND.ID)
        }

        // Validar usuario
        const user = await this.userRepository.findById(userId)
        if (!user) {
          throw new NotFoundException(MESSAGE_RESPONSE.NOT_FOUND.USER)
        }

        const stockBefore = product.stock ?? 0
        const stockAfter = stockBefore - quantity

        // Validar stock suficiente
        if (stockAfter < 0) {
          throw new ConflictException(
            `Stock insuficiente. Stock actual: ${stockBefore}, cantidad solicitada: ${quantity}`,
          )
        }

        // Actualizar stock del producto
        await this.productRepository.update(
          productId,
          { stock: stockAfter },
          entityManager,
        )

        // Crear entrada en Kardex
        const finalUnitCost = unitCost ?? product.price ?? 0
        const taxRate = 15
        const subtotal = parseFloat((quantity * finalUnitCost).toFixed(6))
        const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(6))
        const total = parseFloat((subtotal + taxAmount).toFixed(6))

        await this.kardexRepository.create(
          {
            product,
            user,
            movementType: KardexMovementType.SALE, // o el tipo que corresponda según tu lógica
            quantity,
            unitCost: finalUnitCost,
            subtotal,
            taxRate,
            taxAmount,
            total,
            stockBefore,
            stockAfter,
            reason,
          },
          entityManager,
        )

        return {
          productId,
          productName: product.name,
          stockBefore,
          stockAfter,
          quantityDiscounted: quantity,
          success: true,
        }
      } catch (error) {
        return {
          productId,
          productName: '', // No pudimos obtener el nombre del producto
          stockBefore: 0,
          stockAfter: 0,
          quantityDiscounted: 0,
          success: false,
          error: error.message || 'Error desconocido',
        }
      }
    })
  }

  /**
   * Descuenta stock de múltiples productos en una sola transacción
   * @param discounts Array de productos y cantidades a descontar
   * @param userId ID del usuario que realiza la operación
   * @returns Promise<BulkStockDiscountResult>
   */
  async discountMultipleProducts(
    discounts: ProductStockDiscount[],
    userId: string,
  ): Promise<BulkStockDiscountResult> {
    return this.dataSource.transaction(async (entityManager) => {
      const successful: StockDiscountResponse[] = []
      const failed: StockDiscountResponse[] = []

      // Validar usuario una sola vez
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new NotFoundException(MESSAGE_RESPONSE.NOT_FOUND.USER)
      }

      // Procesar cada producto
      for (const discount of discounts) {
        try {
          // Validaciones básicas
          if (discount.quantity <= 0) {
            failed.push({
              productId: discount.productId,
              productName: '',
              stockBefore: 0,
              stockAfter: 0,
              quantityDiscounted: 0,
              success: false,
              error: 'La cantidad debe ser mayor a 0',
            })
            continue
          }

          // Buscar el producto
          const product = await this.productRepository.findById(
            discount.productId,
          )
          if (!product) {
            failed.push({
              productId: discount.productId,
              productName: '',
              stockBefore: 0,
              stockAfter: 0,
              quantityDiscounted: 0,
              success: false,
              error: 'Producto no encontrado',
            })
            continue
          }

          const stockBefore = product.stock ?? 0
          const stockAfter = stockBefore - discount.quantity

          // Validar stock suficiente
          if (stockAfter < 0) {
            failed.push({
              productId: discount.productId,
              productName: product.name,
              stockBefore,
              stockAfter: stockBefore,
              quantityDiscounted: 0,
              success: false,
              error: `Stock insuficiente. Stock actual: ${stockBefore}, cantidad solicitada: ${discount.quantity}`,
            })
            continue
          }

          // Actualizar stock del producto
          await this.productRepository.update(
            discount.productId,
            { stock: stockAfter },
            entityManager,
          )

          // Crear entrada en Kardex
          const unitCost = discount.unitCost ?? product.price ?? 0
          const taxRate = 15
          const subtotal = parseFloat((discount.quantity * unitCost).toFixed(6))
          const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(6))
          const total = parseFloat((subtotal + taxAmount).toFixed(6))

          await this.kardexRepository.create(
            {
              product,
              user,
              movementType: KardexMovementType.SALE,
              quantity: discount.quantity,
              unitCost,
              subtotal,
              taxRate,
              taxAmount,
              total,
              stockBefore,
              stockAfter,
              reason: discount.reason ?? 'Descuento de stock masivo',
            },
            entityManager,
          )

          successful.push({
            productId: discount.productId,
            productName: product.name,
            stockBefore,
            stockAfter,
            quantityDiscounted: discount.quantity,
            success: true,
          })
        } catch (error) {
          failed.push({
            productId: discount.productId,
            productName: '',
            stockBefore: 0,
            stockAfter: 0,
            quantityDiscounted: 0,
            success: false,
            error: error.message || 'Error desconocido',
          })
        }
      }

      return {
        successful,
        failed,
        totalProcessed: discounts.length,
        totalSuccessful: successful.length,
        totalFailed: failed.length,
      }
    })
  }

  /**
   * Verifica si hay stock suficiente para un producto
   * @param productId ID del producto
   * @param quantity Cantidad requerida
   * @returns Promise<boolean>
   */
  async hasEnoughStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.productRepository.findById(productId)
    if (!product) return false

    const currentStock = product.stock ?? 0
    return currentStock >= quantity
  }

  /**
   * Consulta el/los impuestos de uno o varios productos
   * @param products Array de productos (mínimo: id del producto)
   * @returns Promise<{ productId: string; productName?: string; taxRate: number; taxValue: number }[]>
   */
  async getProductsTaxes(
    products: Pick<ProductStockDiscount, 'productId' | 'quantity'>[],
  ): Promise<
    {
      productId: string
      productName?: string
      taxRate: number
      taxValue: number
      basePrice: number
    }[]
  > {
    const results: {
      productId: string
      productName?: string
      taxRate: number
      taxValue: number
      basePrice: number
    }[] = []

    for (const item of products) {
      const product = await this.productRepository.findById(item.productId)

      if (!product) {
        results.push({
          productId: item.productId,
          productName: undefined,
          taxRate: 0,
          taxValue: 0,
          basePrice: 0,
        })
        continue
      }

      const basePrice = product.price ?? 0
      const taxRate = product.tax ?? 0
      const taxValue = (basePrice * item.quantity * taxRate) / 100

      results.push({
        productId: item.productId,
        productName: product.name,
        taxRate,
        taxValue,
        basePrice,
      })
    }

    return results
  }

  /**
   * Verifica stock suficiente para múltiples productos
   * @param discounts Array de productos y cantidades
   * @returns Promise<{ productId: string; hasStock: boolean; currentStock: number; requiredStock: number }[]>
   */
  async checkMultipleProductsStock(
    discounts: Pick<ProductStockDiscount, 'productId' | 'quantity'>[],
  ): Promise<
    {
      productId: string
      hasStock: boolean
      currentStock: number
      requiredStock: number
      productName?: string
    }[]
  > {
    const results: {
      productId: string
      hasStock: boolean
      currentStock: number
      requiredStock: number
      productName?: string
    }[] = []

    for (const discount of discounts) {
      const product = await this.productRepository.findById(discount.productId)
      const currentStock = product?.stock ?? 0
      const hasStock = currentStock >= discount.quantity

      results.push({
        productId: discount.productId,
        hasStock,
        currentStock,
        requiredStock: discount.quantity,
        productName: product?.name,
      })
    }

    return results
  }

  /**
   * Obtiene el stock actual de un producto
   * @param productId ID del producto
   * @returns Promise<number | null>
   */
  async getCurrentStock(productId: string): Promise<number | null> {
    const product = await this.productRepository.findById(productId)
    return product?.stock ?? null
  }

  /**
   * Obtiene el stock actual de múltiples productos
   * @param productIds Array de IDs de productos
   * @returns Promise<{ productId: string; stock: number | null; productName?: string }[]>
   */
  async getCurrentStockMultiple(
    productIds: string[],
  ): Promise<
    { productId: string; stock: number | null; productName?: string }[]
  > {
    const products = await this.productRepository.findByIds(productIds)

    return productIds.map((id) => {
      const product = products.find((p) => p.id === id)
      return {
        productId: id,
        stock: product?.stock ?? null,
        productName: product?.name,
      }
    })
  }
}
