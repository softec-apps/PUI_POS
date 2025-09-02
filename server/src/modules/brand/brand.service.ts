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
  deletedResponse,
  updatedResponse,
} from '@/common/helpers/responseSuccess.helper'
import { Brand } from '@/modules/brand/domain/brand'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { BrandStatus } from '@/modules/brand/status.enum'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'
import { QueryBrandDto } from '@/modules/brand/dto/query-brand.dto'
import { CreateBrandDto } from '@/modules/brand/dto/create-brand.dto'
import { UpdateBrandDto } from '@/modules/brand/dto/update-brand.dto'
import { MESSAGE_RESPONSE } from '@/modules/brand/messages/responseOperation.message'
import { BrandRepository } from '@/modules/brand/infrastructure/persistence/brand.repository'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@Injectable()
export class BrandService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly brandRepository: BrandRepository,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<ApiResponse<Brand>> {
    return this.dataSource.transaction(async (entityManager) => {
      if (createBrandDto.name) {
        const existingName = await this.brandRepository.findByField(
          'name',
          createBrandDto.name,
        )
        if (existingName) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE.CONFLIC.NAME,
          })
        }
      }

      // Validación y asignación del status con valor por defecto
      const status =
        createBrandDto.status &&
        Object.values(BrandStatus).includes(createBrandDto.status)
          ? createBrandDto.status
          : BrandStatus.ACTIVE

      await this.brandRepository.create(
        {
          name: createBrandDto.name,
          description: createBrandDto.description,
          status: status,
        },
        entityManager,
      )

      return createdResponse({
        resource: PATH_SOURCE.BRAND,
        message: MESSAGE_RESPONSE.CREATED,
      })
    })
  }

  async findManyWithPagination(
    query: QueryBrandDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Brand>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10
    if (limit > 50) limit = 50

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.brandRepository.findManyWithPagination({
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
      resource: PATH_SOURCE.BRAND,
      message: MESSAGE_RESPONSE.LISTED,
    })
  }

  async findById(id: Brand['id']): Promise<ApiResponse<Brand>> {
    const result = await this.brandRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE.NOT_FOUND.ID,
      })
    }

    return readResponse({
      data: result,
      resource: PATH_SOURCE.BRAND,
      message: MESSAGE_RESPONSE.READED,
    })
  }

  async findByIds(ids: Brand['id'][]): Promise<Brand[]> {
    return this.brandRepository.findByIds(ids)
  }

  async update(
    id: Brand['id'],
    updateBrandDto: UpdateBrandDto,
  ): Promise<ApiResponse<Brand>> {
    return this.dataSource.transaction(async (entityManager) => {
      let name: string | null | undefined = undefined
      if (updateBrandDto.name !== undefined) {
        if (updateBrandDto.name) {
          const existingBrand = await this.brandRepository.findByField(
            'name',
            updateBrandDto.name,
          )
          if (existingBrand && existingBrand.id !== id) {
            throw new NotFoundException({
              message: MESSAGE_RESPONSE.NOT_FOUND.ID,
            })
          }
        }

        name = updateBrandDto.name
      }

      let description: string | null | undefined = undefined
      if (updateBrandDto.description !== undefined) {
        description =
          updateBrandDto.description === '' ||
          updateBrandDto.description === null
            ? null
            : updateBrandDto.description
      }

      // Validación del status
      let status: BrandStatus | undefined = undefined
      if (updateBrandDto.status !== undefined) {
        status = Object.values(BrandStatus).includes(updateBrandDto.status)
          ? updateBrandDto.status
          : BrandStatus.ACTIVE
      }

      await this.brandRepository.update(
        id,
        {
          name: name,
          description: description,
          status: status,
        },
        entityManager,
      )

      return updatedResponse({
        resource: PATH_SOURCE.BRAND,
        message: MESSAGE_RESPONSE.UPDATED,
      })
    })
  }

  async softDelete(id: Brand['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const user = await this.brandRepository.findById(id)

      if (!user) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.brandRepository.update(
        id,
        {
          status: BrandStatus.INACTIVE,
        },
        entityManager,
      )

      await this.brandRepository.softDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.BRAND,
        message: MESSAGE_RESPONSE.DELETED.SOFT,
      })
    })
  }

  async restore(id: Brand['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const brand = await this.brandRepository.findById(id)

      if (!brand) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.brandRepository.update(
        id,
        {
          status: BrandStatus.ACTIVE,
        },
        entityManager,
      )

      await this.brandRepository.restore(id, entityManager)

      return updatedResponse({
        resource: PATH_SOURCE.SUPPLIER,
        message: MESSAGE_RESPONSE.RESTORED,
      })
    })
  }

  async hardDelete(id: Brand['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const brand = await this.brandRepository.findById(id)

      if (!brand) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.brandRepository.hardDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.BRAND,
        message: MESSAGE_RESPONSE.DELETED.HARD,
      })
    })
  }
}
