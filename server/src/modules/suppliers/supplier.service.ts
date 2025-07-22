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
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { SupplierStatus } from '@/modules/suppliers/status.enum'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'
import { QuerySupplierDto } from '@/modules/suppliers/dto/query-supplier.dto'
import { CreateSupplierDto } from '@/modules/suppliers/dto/create-supplier.dto'
import { UpdateSupplierDto } from '@/modules/suppliers/dto/update-supplier.dto'
import { MESSAGE_RESPONSE } from '@/modules/suppliers/messages/responseOperation.message'
import { SupplierRepository } from '@/modules/suppliers/infrastructure/persistence/supplier.repository'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@Injectable()
export class SupplierService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async create(
    createSupplierDto: CreateSupplierDto,
  ): Promise<ApiResponse<Supplier>> {
    return this.dataSource.transaction(async (entityManager) => {
      if (createSupplierDto.ruc) {
        const existingRuc = await this.supplierRepository.findByField(
          'ruc',
          createSupplierDto.ruc,
        )
        if (existingRuc) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE.CONFLIC.RUC,
          })
        }
      }

      if (createSupplierDto.legalName) {
        const existingSupplier = await this.supplierRepository.findByField(
          'legalName',
          createSupplierDto.legalName,
        )

        if (existingSupplier) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE.CONFLIC.LEGAL_NAME,
          })
        }
      }

      // Validación y asignación del status con valor por defecto
      const status =
        createSupplierDto.status &&
        Object.values(SupplierStatus).includes(createSupplierDto.status)
          ? createSupplierDto.status
          : SupplierStatus.ACTIVE

      await this.supplierRepository.create(
        {
          ruc: createSupplierDto.ruc,
          legalName: createSupplierDto.legalName,
          commercialName: createSupplierDto.commercialName,
          status: status,
        },
        entityManager,
      )

      return createdResponse({
        resource: PATH_SOURCE.SUPPLIER,
        message: MESSAGE_RESPONSE.CREATED,
      })
    })
  }

  async findManyWithPagination(
    query: QuerySupplierDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Supplier>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10
    if (limit > 50) limit = 50

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.supplierRepository.findManyWithPagination({
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
      resource: PATH_SOURCE.SUPPLIER,
      message: 'Categorias obtenidas exitosamente',
    })
  }

  async findById(id: Supplier['id']): Promise<ApiResponse<Supplier>> {
    const result = await this.supplierRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE.NOT_FOUND.ID,
      })
    }

    return readResponse({
      data: result,
      resource: PATH_SOURCE.SUPPLIER,
      message: MESSAGE_RESPONSE.READED,
    })
  }

  async findByIds(ids: Supplier['id'][]): Promise<Supplier[]> {
    return this.supplierRepository.findByIds(ids)
  }

  async update(
    id: Supplier['id'],
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<ApiResponse<Supplier>> {
    return this.dataSource.transaction(async (entityManager) => {
      let ruc: string | null | undefined = undefined
      if (updateSupplierDto.ruc !== undefined) {
        if (updateSupplierDto.ruc) {
          const existingSupplier = await this.supplierRepository.findByField(
            'ruc',
            updateSupplierDto.ruc,
          )
          if (existingSupplier && existingSupplier.id !== id) {
            throw new NotFoundException({
              message: MESSAGE_RESPONSE.NOT_FOUND.ID,
            })
          }
        }

        ruc = updateSupplierDto.ruc
      }

      let legalName: string | null | undefined = undefined
      if (updateSupplierDto.legalName !== undefined) {
        legalName =
          updateSupplierDto.legalName === '' ||
          updateSupplierDto.legalName === null
            ? null
            : updateSupplierDto.legalName
      }

      let commercialName: string | null | undefined = undefined
      if (updateSupplierDto.commercialName !== undefined) {
        commercialName =
          updateSupplierDto.commercialName === '' ||
          updateSupplierDto.commercialName === null
            ? null
            : updateSupplierDto.commercialName
      }

      // Validación del status
      let status: SupplierStatus | undefined = undefined
      if (updateSupplierDto.status !== undefined) {
        status = Object.values(SupplierStatus).includes(
          updateSupplierDto.status,
        )
          ? updateSupplierDto.status
          : SupplierStatus.ACTIVE
      }

      await this.supplierRepository.update(
        id,
        {
          ruc: ruc,
          legalName: updateSupplierDto.legalName,
          commercialName: updateSupplierDto.commercialName,
          status: updateSupplierDto.status,
          deletedAt: updateSupplierDto.deletedAt,
        },

        entityManager,
      )

      return updatedResponse({
        resource: PATH_SOURCE.SUPPLIER,
        message: MESSAGE_RESPONSE.UPDATED,
      })
    })
  }

  async restore(id: Supplier['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const supplier = await this.supplierRepository.findById(id)

      if (!supplier) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.supplierRepository.update(
        id,
        {
          status: SupplierStatus.ACTIVE,
        },
        entityManager,
      )

      await this.supplierRepository.restore(id, entityManager)

      return updatedResponse({
        resource: PATH_SOURCE.SUPPLIER,
        message: MESSAGE_RESPONSE.RESTORED,
      })
    })
  }

  async hardDelete(id: Supplier['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const supplier = await this.supplierRepository.findById(id)

      if (!supplier) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.supplierRepository.hardDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.SUPPLIER,
        message: MESSAGE_RESPONSE.DELETED.HARD,
      })
    })
  }
}
