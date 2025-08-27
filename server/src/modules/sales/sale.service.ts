import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { DataSource } from 'typeorm'

import { SaleRepository } from '@/modules/sales/infrastructure/persistence/sale.repository'
import { StockDiscountService } from '@/modules/product/managerStock.service'
import { Sale } from '@/modules/sales/domain/sale'

import { CreateSaleDto } from '@/modules/sales/dto/create-sale.dto'
import { QuerySaleDto } from '@/modules/sales/dto/query-sale.dto'

import { ApiResponse } from '@/utils/types/request-response.type'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'
import {
  createdResponse,
  listResponse,
  readResponse,
} from '@/common/helpers/responseSuccess.helper'
import { SaleItem } from './domain/saleItem'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Injectable()
export class SaleService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly saleRepository: SaleRepository,
    private readonly stockDiscountService: StockDiscountService,
  ) {}

  async createSale(
    createSaleDto: CreateSaleDto,
    userId: string,
  ): Promise<ApiResponse<Sale>> {
    return this.dataSource.transaction(async (entityManager) => {
      // 1. Validar que todos los productos tengan stock suficiente antes de crear la venta
      const stockValidations =
        await this.stockDiscountService.checkMultipleProductsStock(
          createSaleDto.items
            .filter((item) => item.productId)
            .map((item) => ({
              productId: item.productId!,
              quantity: item.quantity,
            })),
        )

      // Verificar si algún producto no tiene stock suficiente
      const insufficientStock = stockValidations.filter(
        (validation) => !validation.hasStock,
      )
      if (insufficientStock.length > 0) {
        const errorMessages = insufficientStock
          .map(
            (stock) =>
              `${stock.productName || stock.productId}: Stock actual ${stock.currentStock}, requerido ${stock.requiredStock}`,
          )
          .join(', ')

        throw new ConflictException(`Stock insuficiente para: ${errorMessages}`)
      }

      // 2. Descontar stock de todos los productos
      const stockDiscounts = createSaleDto.items
        .filter((item) => item.productId) // Solo productos que tienen ID
        .map((item) => ({
          productId: item.productId!,
          quantity: item.quantity,
          reason: `Venta - ${item.productName}`,
          unitCost: item.unitPrice, // Usar el precio unitario de la venta
        }))

      if (stockDiscounts.length > 0) {
        const discountResult =
          await this.stockDiscountService.discountMultipleProducts(
            stockDiscounts,
            userId,
          )

        // Si algún descuento falló, lanzar error
        if (discountResult.totalFailed > 0) {
          const failedProducts = discountResult.failed
            .map(
              (failed) =>
                `${failed.productName || failed.productId}: ${failed.error}`,
            )
            .join(', ')

          throw new ConflictException(
            `Error al descontar stock: ${failedProducts}`,
          )
        }
      }

      await this.saleRepository.create(
        {
          customerId: createSaleDto.customerId,
          subtotal: createSaleDto.subtotal,
          taxRate: createSaleDto.taxRate,
          taxAmount: createSaleDto.taxAmount,
          total: createSaleDto.total,
          totalItems: createSaleDto.totalItems,
          paymentMethod: createSaleDto.paymentMethod,
          receivedAmount: createSaleDto.receivedAmount,
          change: createSaleDto.change,
          items: createSaleDto.items.map((item) => {
            const saleItem = new SaleItem()
            saleItem.productName = item.productName
            saleItem.productCode = item.productCode!
            saleItem.quantity = item.quantity
            saleItem.unitPrice = item.unitPrice
            saleItem.taxRate = item.taxRate
            saleItem.totalPrice = item.totalPrice
            saleItem.product = item.productId
              ? ({ id: item.productId } as any)
              : null
            return saleItem
          }),
        },
        entityManager,
      )

      return createdResponse({
        resource: PATH_SOURCE.SALE,
        message: 'Venta creada exitosamente',
      })
    })
  }

  async findManyWithPagination(
    query: QuerySaleDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Sale>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10
    if (limit > 50) limit = 50

    const { data, totalCount, totalRecords } =
      await this.saleRepository.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: { page, limit },
        searchOptions: query?.search,
      })

    const paginatedData = infinityPaginationWithMetadata(
      data,
      { page, limit },
      totalCount,
      totalRecords,
    )

    return listResponse({
      resource: PATH_SOURCE.SALE,
      message: 'Ventas obtenidas exitosamente',
      data: paginatedData,
    })
  }

  async findById(id: Sale['id']): Promise<ApiResponse<Sale>> {
    const sale = await this.saleRepository.findById(id)

    if (!sale) {
      throw new NotFoundException({
        message: 'No se pudo encontrar la venta',
      })
    }

    return readResponse({
      resource: PATH_SOURCE.SALE,
      message: 'Venta obtenida exitosamente',
      data: sale,
    })
  }

  async findByIds(ids: Sale['id'][]): Promise<Sale[]> {
    return this.saleRepository.findByIds(ids)
  }

  async findByCustomerId(
    customerId: string,
  ): Promise<ApiResponse<Sale | null>> {
    const sale = await this.saleRepository.findByField('customer', customerId)

    if (!sale) {
      return readResponse({
        resource: PATH_SOURCE.SALE,
        message: 'No se encontraron ventas para este cliente',
        data: null,
      })
    }

    return readResponse({
      resource: PATH_SOURCE.SALE,
      message: 'Venta encontrada para el cliente',
      data: sale,
    })
  }
}
