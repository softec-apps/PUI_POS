import { DataSource } from 'typeorm'
import {
  listResponse,
  readResponse,
  createdResponse,
  deletedResponse,
  updatedResponse,
} from '@/common/helpers/responseSuccess.helper'
import { Establishment } from '@/modules/establishment/domain/establishment'
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'

import { QueryEstablishmentDto } from '@/modules/establishment/dto/query-establishment.dto'
import { CreateEstablishmentDto } from '@/modules/establishment/dto/create-establishment.dto'
import { UpdateEstablishmentDto } from '@/modules/establishment/dto/update-establishment.dto'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

import { MESSAGE_RESPONSE } from '@/modules/establishment/messages/responseOperation.message'

import { FileRepository } from '@/modules/files/infrastructure/persistence/file.repository'
import { BillingService } from '@/modules/factuZen/services/factuZen.service'
import { EstablishmentRepository } from '@/modules/establishment/infrastructure/persistence/establishment.repository'

import { FileType } from '@/modules/files/domain/file'
import { FilesService } from '@/modules/files/files.service'
import { Accounting, EnvironmentType, TypeOfIssue } from './establishment.enum'

@Injectable()
export class EstablishmentService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
    private readonly billingService: BillingService,
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async create(
    createEstablishmentDto: CreateEstablishmentDto,
  ): Promise<ApiResponse<Establishment>> {
    return this.dataSource.transaction(async (entityManager) => {
      let photo: FileType | null | undefined = undefined
      if (createEstablishmentDto.photo?.id) {
        const fileObject = await this.filesService.findById(
          createEstablishmentDto.photo.id,
        )
        if (!fileObject) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE.NOT_FOUND.IMAGE,
          })
        }
        photo = fileObject
      } else if (createEstablishmentDto.photo === null) {
        photo = null
      }

      // Crear el establishmento con todas las propiedades requeridas
      await this.establishmentRepository.create(
        {
          ruc: createEstablishmentDto.ruc,
          companyName: createEstablishmentDto.companyName,
          tradeName: createEstablishmentDto.tradeName,
          parentEstablishmentAddress:
            createEstablishmentDto.parentEstablishmentAddress!,
          accounting: createEstablishmentDto.accounting,
          photo,
          environmentType: createEstablishmentDto.environmentType,
        },
        entityManager,
      )

      return createdResponse({
        resource: PATH_SOURCE.ESTABLISHMENT,
        message: MESSAGE_RESPONSE.CREATED,
      })
    })
  }

  async findManyWithPagination(
    query: QueryEstablishmentDto,
  ): Promise<
    ApiResponse<EnhancedInfinityPaginationResponseDto<Establishment>>
  > {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10
    if (limit > 50) limit = 50

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.establishmentRepository.findManyWithPagination({
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
      resource: PATH_SOURCE.ESTABLISHMENT,
      message: MESSAGE_RESPONSE.LISTED,
    })
  }

  async findById(id: Establishment['id']): Promise<ApiResponse<Establishment>> {
    const result = await this.establishmentRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE.NOT_FOUND.ID,
      })
    }

    return readResponse({
      data: result,
      resource: PATH_SOURCE.ESTABLISHMENT,
      message: MESSAGE_RESPONSE.READED,
    })
  }

  async findByIds(ids: Establishment['id'][]): Promise<Establishment[]> {
    return this.establishmentRepository.findByIds(ids)
  }

  async update(
    id: Establishment['id'],
    updateEstablishmentDto: UpdateEstablishmentDto,
  ): Promise<ApiResponse<Establishment>> {
    return this.dataSource.transaction(async (entityManager) => {
      // Verificar que el establishment exista antes de actualizar
      const existingEstablishment =
        await this.establishmentRepository.findById(id)
      if (!existingEstablishment) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      // Manejo del RUC con validación de duplicados
      let ruc: string | undefined = undefined
      if (updateEstablishmentDto.ruc !== undefined) {
        if (updateEstablishmentDto.ruc) {
          const existingWithRuc =
            await this.establishmentRepository.findByField(
              'ruc',
              updateEstablishmentDto.ruc,
            )
          if (existingWithRuc && existingWithRuc.id !== id) {
            throw new ConflictException({
              message: 'Ya existe un establishment con este RUC',
            })
          }
        }
        ruc = updateEstablishmentDto.ruc
      }

      // Manejo de companyName (razón social) - obligatorio
      let companyName: string | undefined = undefined
      if (updateEstablishmentDto.companyName !== undefined) {
        companyName = updateEstablishmentDto.companyName
      }

      // Manejo de tradeName (nombre comercial) - obligatorio
      let tradeName: string | undefined = undefined
      if (updateEstablishmentDto.tradeName !== undefined) {
        tradeName = updateEstablishmentDto.tradeName
      }

      // Manejo de parentEstablishmentAddress (dirección matriz) - opcional
      let parentEstablishmentAddress: string | null | undefined = undefined
      if (updateEstablishmentDto.parentEstablishmentAddress !== undefined) {
        parentEstablishmentAddress =
          updateEstablishmentDto.parentEstablishmentAddress === '' ||
          updateEstablishmentDto.parentEstablishmentAddress === null
            ? null
            : updateEstablishmentDto.parentEstablishmentAddress
      }

      // Manejo de accounting (contabilidad) - obligatorio, enum
      let accounting: Accounting | undefined = undefined
      if (updateEstablishmentDto.accounting !== undefined) {
        accounting = updateEstablishmentDto.accounting
      }

      // Manejo de environmentType (tipo ambiente) - obligatorio, enum
      let environmentType: EnvironmentType | undefined = undefined
      if (updateEstablishmentDto.environmentType !== undefined) {
        environmentType = updateEstablishmentDto.environmentType
      }

      // Manejo de la imagen (photo) - opcional
      let photo: FileType | null | undefined = undefined
      if (updateEstablishmentDto.photo !== undefined) {
        if (
          updateEstablishmentDto.photo &&
          typeof updateEstablishmentDto.photo === 'string'
        ) {
          // Si photo es un string, es el ID del archivo
          const fileObject = await this.filesService.findById(
            updateEstablishmentDto.photo,
          )
          if (!fileObject) {
            throw new NotFoundException({
              message: MESSAGE_RESPONSE.NOT_FOUND.IMAGE,
            })
          }
          photo = fileObject
        } else if (updateEstablishmentDto.photo?.id) {
          // Si photo es un objeto con id
          const fileObject = await this.filesService.findById(
            updateEstablishmentDto.photo.id,
          )
          if (!fileObject) {
            throw new NotFoundException({
              message: MESSAGE_RESPONSE.NOT_FOUND.IMAGE,
            })
          }
          photo = fileObject
        } else if (updateEstablishmentDto.photo === null) {
          // Si se quiere eliminar la imagen
          photo = null
        }
      }

      // Ejecutar la actualización del establishment
      await this.establishmentRepository.update(
        id,
        {
          ruc,
          companyName,
          tradeName,
          parentEstablishmentAddress,
          accounting,
          photo,
          environmentType,
        },
        entityManager,
      )

      // Factus Zen - Sincronizacion con profile
      await this.billingService.updateProfile({
        name: companyName,
        razonSocial: companyName,
        nombreComercial: tradeName,
        dirMatriz: parentEstablishmentAddress ?? '',
      })

      return updatedResponse({
        resource: PATH_SOURCE.ESTABLISHMENT,
        message: MESSAGE_RESPONSE.UPDATED,
      })
    })
  }

  async restore(id: Establishment['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const establishment = await this.establishmentRepository.findById(id)

      if (!establishment) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.establishmentRepository.restore(id, entityManager)

      return updatedResponse({
        resource: PATH_SOURCE.ESTABLISHMENT,
        message: MESSAGE_RESPONSE.RESTORED,
      })
    })
  }

  async hardDelete(id: Establishment['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const establishment = await this.establishmentRepository.findById(id)

      if (!establishment) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.establishmentRepository.hardDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.ESTABLISHMENT,
        message: MESSAGE_RESPONSE.DELETED.HARD,
      })
    })
  }
}
