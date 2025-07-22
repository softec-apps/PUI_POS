import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { DataSource } from 'typeorm'
import { Atribute } from '@/modules/atributes/domain/atribute'
import { AtributeTypeAllow } from './atribute-types-allow.enum'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import {
  createdResponse,
  deletedResponse,
  listResponse,
  readResponse,
  updatedResponse,
} from '@/common/helpers/responseSuccess.helper'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'
import { QueryAtributeDto } from '@/modules/atributes/dto/query-atribute.dto'
import { CreateAtributeDto } from '@/modules/atributes/dto/create-atribute.dto'
import { UpdateAtributeDto } from '@/modules/atributes/dto/update-atribute.dto'
import { MESSAGE_RESPONSE_ATRIBUTE } from '@/modules/atributes/messages/responseOperation.message'
import { AtributeRepository } from '@/modules/atributes/infrastructure/persistence/atribute.repository'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@Injectable()
export class AtributesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly atributesRepository: AtributeRepository,
  ) {}

  async create(
    createAtributeDto: CreateAtributeDto,
  ): Promise<ApiResponse<Atribute>> {
    return this.dataSource.transaction(async (entityManager) => {
      const existingAtribute = await this.atributesRepository.findByField(
        'name',
        createAtributeDto.name,
      )

      if (existingAtribute) {
        throw new ConflictException({
          message: MESSAGE_RESPONSE_ATRIBUTE.CONFLIC.NAME,
        })
      }

      // Creación del nuevo atributo
      await this.atributesRepository.create(
        {
          name: createAtributeDto.name ?? null,
          type: createAtributeDto.type,
          options: createAtributeDto.options ?? [],
          required: createAtributeDto.required ?? false,
        },
        entityManager,
      )

      return createdResponse({
        resource: PATH_SOURCE.ATRIBUTE,
        message: MESSAGE_RESPONSE_ATRIBUTE.CREATED,
      })
    })
  }

  async findManyWithPagination(
    query: QueryAtributeDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Atribute>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10
    if (limit > 50) limit = 50

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.atributesRepository.findManyWithPagination({
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
      resource: PATH_SOURCE.ATRIBUTE,
      message: MESSAGE_RESPONSE_ATRIBUTE.LIST,
    })
  }

  async findById(id: Atribute['id']): Promise<ApiResponse<Atribute>> {
    const result = await this.atributesRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE_ATRIBUTE.NOT_FOUND.ID,
      })
    }

    return readResponse({
      data: result,
      resource: PATH_SOURCE.ATRIBUTE,
      message: MESSAGE_RESPONSE_ATRIBUTE.READED,
    })
  }

  async findByIds(ids: Atribute['id'][]): Promise<Atribute[]> {
    const result = await this.atributesRepository.findByIds(ids)

    if (!result || result.length === 0) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE_ATRIBUTE.NOT_FOUND.ID,
      })
    }

    // Verificar si faltan algunos IDs
    if (result.length !== ids.length) {
      const foundIds = result.map((atr) => atr.id)
      const missingIds = ids.filter((id) => !foundIds.includes(id))

      throw new NotFoundException({
        message: `Los siguientes IDs de atributos no existen: ${missingIds.join(', ')}`,
      })
    }

    return result
  }

  async update(
    id: Atribute['id'],
    updateAtributeDto: UpdateAtributeDto,
  ): Promise<ApiResponse<Atribute>> {
    return this.dataSource.transaction(async (entityManager) => {
      const atribute = await this.atributesRepository.findById(id)

      if (!atribute) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE_ATRIBUTE.NOT_FOUND.ID,
        })
      }

      if (updateAtributeDto.name) {
        const existing = await this.atributesRepository.findByField(
          'name',
          updateAtributeDto.name,
        )
        if (existing && existing.id !== id) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE_ATRIBUTE.CONFLIC.NAME,
          })
        }
      }

      // Obtener el atributo actual
      const existingAtribute = await this.atributesRepository.findById(id)
      if (!existingAtribute)
        throw new NotFoundException({
          name: MESSAGE_RESPONSE_ATRIBUTE.NOT_FOUND.ID,
        })

      // Determinar el tipo final (nuevo o existente)
      const finalType = updateAtributeDto.type ?? existingAtribute.type

      // Determinar las opciones basándose en el tipo
      let finalOptions: string[] | undefined

      if (updateAtributeDto.type) {
        // Si se está cambiando el tipo
        if (finalType === AtributeTypeAllow.ENUM) {
          // Si el nuevo tipo es ENUM, mantener las opciones enviadas o las existentes (convertir null a undefined)
          finalOptions =
            updateAtributeDto.options ?? existingAtribute.options ?? undefined
        } else {
          // Si el nuevo tipo NO es ENUM, resetear opciones a array vacío
          finalOptions = []
        }
      } else {
        // Si NO se está cambiando el tipo, usar las opciones enviadas o mantener las existentes (convertir null a undefined)
        finalOptions =
          updateAtributeDto.options ?? existingAtribute.options ?? undefined
      }

      // Actualizar campos permitidos
      await this.atributesRepository.update(
        id,
        {
          name: updateAtributeDto.name ?? existingAtribute.name,
          type: finalType,
          required:
            updateAtributeDto.required !== undefined
              ? updateAtributeDto.required
              : existingAtribute.required,
          options: finalOptions,
        },
        entityManager,
      )

      return updatedResponse({
        resource: PATH_SOURCE.ATRIBUTE,
        message: MESSAGE_RESPONSE_ATRIBUTE.UPDATED,
      })
    })
  }

  async hardDelete(id: Atribute['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const atribute = await this.atributesRepository.findById(id)

      if (!atribute) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE_ATRIBUTE.NOT_FOUND.ID,
        })
      }

      await this.atributesRepository.hardDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.ATRIBUTE,
        message: MESSAGE_RESPONSE_ATRIBUTE.DELETED.HARD,
      })
    })
  }
}
