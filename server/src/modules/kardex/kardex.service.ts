import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  listResponse,
  readResponse,
  createdResponse,
} from '@/common/helpers/responseSuccess.helper'
import { Kardex } from '@/modules/kardex/domain/kardex'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { KardexMovementType } from '@/modules/kardex/movement-type.enum'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'
import { QueryKardexDto } from '@/modules/kardex/dto/query-kardex.dto'
import { CreateKardexDto } from '@/modules/kardex/dto/create-kardex.dto'
import { MESSAGE_RESPONSE } from '@/modules/kardex/messages/responseOperation.message'
import { KardexRepository } from '@/modules/kardex/infrastructure/persistence/kardex.repository'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'
import { ProductRepository } from '@/modules/product/infrastructure/persistence/product.repository'
import { UserRepository } from '@/modules/users/infrastructure/persistence/user.repository'

@Injectable()
export class KardexService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly kardexRepository: KardexRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(createKardexDto: CreateKardexDto): Promise<ApiResponse> {
    return this.dataSource.transaction(async (entityManager) => {
      const {
        productId,
        userId,
        movementType,
        quantity,
        unitCost,
        reason,
        taxRate,
      } = createKardexDto

      const product = await this.productRepository.findById(productId)
      if (!product)
        throw new NotFoundException({ message: 'Producto no encontrado' })

      const user = await this.userRepository.findById(userId)
      if (!user)
        throw new NotFoundException({ message: 'Usuario no encontrado' })

      const stockBefore = product.stock ?? 0
      const isAddition = movementType === KardexMovementType.PURCHASE
      const stockAfter = isAddition
        ? stockBefore + quantity
        : stockBefore - quantity

      if (stockAfter < 0) {
        throw new ConflictException({
          message: MESSAGE_RESPONSE.CONFLIC.INSUFFICIENT_SCTOCK,
        })
      }

      const subtotal = parseFloat((quantity * unitCost).toFixed(6))
      const taxAmount = parseFloat(
        ((subtotal * (taxRate ?? 0)) / 100).toFixed(6),
      )
      const total = parseFloat((subtotal + taxAmount).toFixed(6))

      // Actualiza el stock del producto
      product.stock = stockAfter
      await this.productRepository.update(
        product.id,
        { stock: stockAfter },
        entityManager,
      )

      await this.kardexRepository.create(
        {
          product,
          user,
          movementType,
          quantity,
          unitCost,
          subtotal,
          taxRate: taxRate,
          taxAmount,
          total,
          stockBefore,
          stockAfter,
          reason: reason,
        },
        entityManager,
      )

      return createdResponse({
        resource: PATH_SOURCE.KARDEX,
        message: MESSAGE_RESPONSE.CREATED,
      })
    })
  }

  async findManyWithPagination(
    query: QueryKardexDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Kardex>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10
    if (limit > 50) limit = 50

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.kardexRepository.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: { page, limit },
        searchOptions: query?.search,
      })

    // Formatear respuesta paginada con la utilidad
    const paginatedData = infinityPaginationWithMetadata(
      data,
      { page, limit },
      totalCount,
      totalRecords,
    )

    return listResponse({
      data: paginatedData,
      resource: PATH_SOURCE.KARDEX,
      message: MESSAGE_RESPONSE.LISTED,
    })
  }

  async findLatestByProductWithPagination(
    query: QueryKardexDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Kardex>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10
    if (limit > 50) limit = 50

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.kardexRepository.findLatestByProductWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: { page, limit },
        searchOptions: query?.search,
      })

    // Formatear respuesta paginada con la utilidad
    const paginatedData = infinityPaginationWithMetadata(
      data,
      { page, limit },
      totalCount,
      totalRecords,
    )

    return listResponse({
      data: paginatedData,
      resource: PATH_SOURCE.KARDEX,
      message: MESSAGE_RESPONSE.LISTED,
    })
  }

  async findById(id: Kardex['id']): Promise<ApiResponse<Kardex>> {
    const result = await this.kardexRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE.NOT_FOUND.ID,
      })
    }

    return readResponse({
      data: result,
      resource: PATH_SOURCE.KARDEX,
      message: MESSAGE_RESPONSE.READED,
    })
  }

  async findByIds(ids: Kardex['id'][]): Promise<Kardex[]> {
    return this.kardexRepository.findByIds(ids)
  }
}
