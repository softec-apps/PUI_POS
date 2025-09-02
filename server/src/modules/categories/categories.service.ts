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
import { FileType } from '@/modules/files/domain/file'
import { FilesService } from '@/modules/files/files.service'
import { Category } from '@/modules/categories/domain/category'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { CategoryStatus } from '@/modules/categories/category-status.enum'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'
import { QueryCategoryDto } from '@/modules/categories/dto/query-category.dto'
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/categories/dto/update-category.dto'
import { MESSAGE_RESPONSE_CATEGORY } from '@/modules/categories/messages/responseOperation.message'
import { CategoryRepository } from '@/modules/categories/infrastructure/persistence/category.repository'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@Injectable()
export class CategoriesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
    private readonly categoriesRepository: CategoryRepository,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    return this.dataSource.transaction(async (entityManager) => {
      if (createCategoryDto.name) {
        const existingCategory = await this.categoriesRepository.findByField(
          'name',
          createCategoryDto.name,
        )
        if (existingCategory) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE_CATEGORY.CONFLIC.NAME,
          })
        }
      }

      let photo: FileType | null | undefined = undefined
      if (createCategoryDto.photo?.id) {
        const fileObject = await this.filesService.findById(
          createCategoryDto.photo.id,
        )
        if (!fileObject) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE_CATEGORY.NOT_FOUND.IMAGE,
          })
        }
        photo = fileObject
      } else if (createCategoryDto.photo === null) {
        photo = null
      }

      // Validación y asignación del status con valor por defecto
      const status =
        createCategoryDto.status &&
        Object.values(CategoryStatus).includes(createCategoryDto.status)
          ? createCategoryDto.status
          : CategoryStatus.ACTIVE

      await this.categoriesRepository.create(
        {
          name: createCategoryDto.name ?? null,
          description: createCategoryDto.description,
          photo,
          status,
        },
        entityManager,
      )

      return createdResponse({
        resource: PATH_SOURCE.CATEGORY,
        message: MESSAGE_RESPONSE_CATEGORY.CREATED,
      })
    })
  }

  async findManyWithPagination(
    query: QueryCategoryDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Category>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10

    // Si el límite es 9999, marcar para obtener todos los registros
    const isGetAll = limit === 9999

    if (!isGetAll && limit > 50) limit = 50

    // Si es obtener todos, usar un límite muy alto para la consulta inicial
    const queryLimit = isGetAll ? Number.MAX_SAFE_INTEGER : limit

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.categoriesRepository.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page: isGetAll ? 1 : page,
          limit: queryLimit,
        },
        searchOptions: query?.search,
      })

    // Para el caso de obtener todos, ajustar los parámetros de paginación
    const finalPage = isGetAll ? 1 : page
    const finalLimit = isGetAll ? totalCount : limit

    // Formatear respuesta paginada con la utilidad
    const paginatedData = infinityPaginationWithMetadata(
      data,
      {
        page: finalPage,
        limit: finalLimit,
      },
      totalCount,
      totalRecords,
    )

    return listResponse({
      data: paginatedData,
      resource: PATH_SOURCE.USER,
      message: MESSAGE_RESPONSE_CATEGORY.LISTED,
    })
  }

  async findById(id: Category['id']): Promise<ApiResponse<Category>> {
    const result = await this.categoriesRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE_CATEGORY.NOT_FOUND.ID,
      })
    }

    return readResponse({
      data: result,
      resource: PATH_SOURCE.CATEGORY,
      message: MESSAGE_RESPONSE_CATEGORY.READED,
    })
  }

  async findByIds(ids: Category['id'][]): Promise<Category[]> {
    return this.categoriesRepository.findByIds(ids)
  }

  async findByName(name: string): Promise<ApiResponse<Category>> {
    const category = await this.categoriesRepository.findByField('name', name)

    if (!category) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE_CATEGORY.NOT_FOUND.NAME,
      })
    }

    return readResponse({
      data: category,
      resource: PATH_SOURCE.CATEGORY,
      message: MESSAGE_RESPONSE_CATEGORY.READED,
    })
  }

  async update(
    id: Category['id'],
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    return this.dataSource.transaction(async (entityManager) => {
      let name: string | null | undefined = undefined
      if (updateCategoryDto.name !== undefined) {
        if (updateCategoryDto.name) {
          const existingCategory = await this.categoriesRepository.findByField(
            'name',
            updateCategoryDto.name,
          )
          if (existingCategory && existingCategory.id !== id) {
            throw new NotFoundException({
              message: MESSAGE_RESPONSE_CATEGORY.NOT_FOUND.ID,
            })
          }
        }
        name = updateCategoryDto.name
      }

      // Manejo de la imagen
      let photo: FileType | null | undefined = undefined
      if (updateCategoryDto.photo?.id) {
        const fileObject = await this.filesService.findById(
          updateCategoryDto.photo.id,
        )
        if (!fileObject) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE_CATEGORY.NOT_FOUND.IMAGE,
          })
        }
        photo = fileObject
      } else if (updateCategoryDto.photo === null) {
        photo = null
      }

      // Validación del status
      let status: CategoryStatus | undefined = undefined
      if (updateCategoryDto.status !== undefined) {
        status = Object.values(CategoryStatus).includes(
          updateCategoryDto.status,
        )
          ? updateCategoryDto.status
          : CategoryStatus.ACTIVE
      }

      // Manejo de la descripción
      let description: string | null | undefined = undefined
      if (updateCategoryDto.description !== undefined) {
        // Si la descripción está presente en el DTO, verificar si es vacía
        description =
          updateCategoryDto.description === '' ||
          updateCategoryDto.description === null
            ? null
            : updateCategoryDto.description
      }

      await this.categoriesRepository.update(
        id,
        {
          name: name,
          description: description,
          photo,
          status,
          deletedAt: updateCategoryDto.deletedAt ?? undefined,
        },
        entityManager,
      )

      return updatedResponse({
        resource: PATH_SOURCE.CATEGORY,
        message: MESSAGE_RESPONSE_CATEGORY.UPDATED,
      })
    })
  }

  async softDelete(id: Category['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const user = await this.categoriesRepository.findById(id)

      if (!user) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE_CATEGORY.NOT_FOUND.ID,
        })
      }

      await this.categoriesRepository.update(
        id,
        {
          status: CategoryStatus.INACTIVE,
        },
        entityManager,
      )

      await this.categoriesRepository.softDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.USER,
        message: MESSAGE_RESPONSE_CATEGORY.DELETED.SOFT,
      })
    })
  }

  async restore(id: Category['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const category = await this.categoriesRepository.findById(id)

      if (!category) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE_CATEGORY.NOT_FOUND.ID,
        })
      }

      await this.categoriesRepository.update(
        id,
        {
          status: CategoryStatus.ACTIVE,
        },
        entityManager,
      )

      await this.categoriesRepository.restore(id, entityManager)

      return updatedResponse({
        resource: PATH_SOURCE.CATEGORY,
        message: MESSAGE_RESPONSE_CATEGORY.RESTORED,
      })
    })
  }

  async hardDelete(id: Category['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const category = await this.categoriesRepository.findById(id)

      if (!category) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE_CATEGORY.NOT_FOUND.ID,
        })
      }

      // delete image table and storage
      if (category.photo)
        await this.filesService.deleteFileRecord(category.photo.id)

      await this.categoriesRepository.hardDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.CATEGORY,
        message: MESSAGE_RESPONSE_CATEGORY.DELETED.HARD,
      })
    })
  }
}
