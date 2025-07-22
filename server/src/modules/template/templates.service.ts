import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { ApiResponse } from '@/utils/types/request-response.type'
import {
  createdResponse,
  deletedResponse,
  listResponse,
  readResponse,
  updatedResponse,
} from '@/common/helpers/responseSuccess.helper'

import { Template } from '@/modules/template/domain/template'
import { Category } from '@/modules/categories/domain/category'

import { AtributesService } from '@/modules/atributes/atributes.service'
import { CategoriesService } from '@/modules/categories/categories.service'

import { QueryTemplateDto } from '@/modules/template/dto/query-template.dto'
import { CreateTemplateDto } from '@/modules/template/dto/create-template.dto'
import { UpdateTemplateDto } from '@/modules/template/dto/update-template.dto'

import { TemplateRepository } from '@/modules/template/infrastructure/persistence/template.repository'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'

@Injectable()
export class TemplateProductService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly atributeService: AtributesService,
    private readonly categoryService: CategoriesService,
    private readonly templateRepository: TemplateRepository,
  ) {}

  async createTemplateWithoutRelaction(
    createTemplateDto: CreateTemplateDto,
    entityManager: EntityManager,
  ): Promise<Template> {
    // 1. Validación de nombre único
    const existingTemplateByName = await this.templateRepository.findByField(
      'name',
      createTemplateDto.name,
    )

    if (existingTemplateByName) {
      throw new ConflictException({
        message: 'El nombre de la plantilla ya existe',
      })
    }

    // 2. Manejo y validación de categoría
    let category: Category | null | undefined = undefined

    if (createTemplateDto.categoryId) {
      // 2.1. Verificar existencia de la categoría
      const categoryResult = await this.categoryService.findById(
        createTemplateDto.categoryId,
      )

      if (!categoryResult) {
        throw new NotFoundException({
          message: 'No se pudo encontrar la categoría',
        })
      }

      category = categoryResult.data

      // 2.2. Validar si ya existe plantilla con esta categoría
      if (category) {
        const existingTemplateByCategory =
          await this.templateRepository.findByField('category', category.id)

        if (existingTemplateByCategory) {
          throw new ConflictException({
            message: 'Ya existe una plantilla con esta categoría',
          })
        }
      }
    } else if (createTemplateDto.categoryId === null) {
      category = null
    }

    // 3. Creación de la plantilla
    return await this.templateRepository.createTemplateWithoutRelaction(
      {
        name: createTemplateDto.name,
        description: createTemplateDto.description,
        category: category,
      },
      entityManager,
    )
  }

  async createRelationTemplateToAtributes(
    templateId: string,
    atributeIds: string[],
    entityManager: EntityManager,
  ): Promise<void> {
    await this.atributeService.findByIds(atributeIds)

    await this.templateRepository.createRelationTemplateToAtributes(
      templateId,
      atributeIds,
      entityManager,
    )
  }

  async createFullTemplate(
    dto: CreateTemplateDto,
  ): Promise<ApiResponse<Template>> {
    return this.dataSource.transaction(async (entityManager) => {
      // 1. Crear plantilla (transaccional)
      const template = await this.createTemplateWithoutRelaction(
        dto,
        entityManager,
      )

      // 2. Crear relaciones (transaccional)
      if (dto.atributeIds?.length) {
        await this.createRelationTemplateToAtributes(
          template.id,
          dto.atributeIds,
          entityManager,
        )
      }

      return createdResponse({
        resource: 'templates',
        message: 'Plantilla creada exitosamente',
      })
    })
  }

  async findManyWithPagination(
    query: QueryTemplateDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Template>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10
    if (limit > 50) limit = 50

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.templateRepository.findManyWithPagination({
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
      resource: 'template',
      message: 'Plantillas obtenidas exitosamente',
    })
  }

  async findById(id: Template['id']): Promise<ApiResponse<Template>> {
    const result = await this.templateRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: 'No se pudo encontrar la plantilla',
      })
    }

    return readResponse({
      data: result,
      resource: 'templates',
      message: 'Plantilla obtenida exitosamente',
    })
  }

  async findByIds(ids: Template['id'][]): Promise<Template[]> {
    return await this.templateRepository.findByIds(ids)
  }

  async updateTemplateWithoutRelation(
    id: Template['id'],
    updateTemplateDto: UpdateTemplateDto,
    entityManager: EntityManager,
  ): Promise<Template | null> {
    console.log(updateTemplateDto)
    let name: string | null | undefined = undefined
    if (updateTemplateDto.name !== undefined) {
      if (updateTemplateDto.name) {
        const existingTemplate = await this.templateRepository.findByField(
          'name',
          updateTemplateDto.name,
        )
        if (existingTemplate && existingTemplate.id !== id) {
          throw new ConflictException({
            message: 'El nombre de la plantilla ya existe',
          })
        }
      }
      name = updateTemplateDto.name
    }

    // Manejo de la categoría
    let category: Category | null | undefined = undefined
    if (updateTemplateDto.categoryId !== undefined) {
      if (updateTemplateDto.categoryId) {
        // Verificar existencia de la categoría
        const categoryResult = await this.categoryService.findById(
          updateTemplateDto.categoryId,
        )
        if (!categoryResult) {
          throw new NotFoundException({
            message: 'No se pudo encontrar la categoría',
          })
        }
        category = categoryResult.data

        // Validar si ya existe otra plantilla con esta categoría
        if (category) {
          const existingTemplateByCategory =
            await this.templateRepository.findByField('category', category.id)
          if (
            existingTemplateByCategory &&
            existingTemplateByCategory.id !== id
          ) {
            throw new ConflictException({
              message: 'Ya existe una plantilla con esta categoría',
            })
          }
        }
      } else if (updateTemplateDto.categoryId === null) {
        category = null
      }
    }

    // Manejo de la descripción
    let description: string | null | undefined = undefined
    if (updateTemplateDto.description !== undefined) {
      description =
        updateTemplateDto.description === '' ||
        updateTemplateDto.description === null
          ? null
          : updateTemplateDto.description
    }

    // Preparamos los campos a actualizar
    const updateData: Partial<Template> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category

    // Actualizamos la entidad
    await this.templateRepository.update(id, updateData, entityManager)

    // Retornamos la plantilla actualizada
    return this.templateRepository.findById(id)
  }

  async updateRelationTemplateToAttributes(
    templateId: string,
    attributeIds: string[],
    entityManager: EntityManager,
  ): Promise<void> {
    // Validación de atributos
    await this.atributeService.findByIds(attributeIds)

    // Primero eliminamos las relaciones existentes
    await this.templateRepository.deleteRelationTemplateToAttributes(
      templateId,
      entityManager,
    )

    // Luego creamos las nuevas relaciones
    if (attributeIds.length > 0) {
      await this.templateRepository.createRelationTemplateToAtributes(
        templateId,
        attributeIds,
        entityManager,
      )
    }
  }

  async update(
    id: Template['id'],
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<ApiResponse<Template>> {
    return this.dataSource.transaction(async (entityManager) => {
      // 1. Verificar que la plantilla existe
      const existingTemplate = await this.templateRepository.findById(id)
      if (!existingTemplate) {
        throw new NotFoundException({
          message: 'Plantilla no encontrada',
        })
      }

      // 2. Actualizar plantilla (transaccional)
      await this.updateTemplateWithoutRelation(
        id,
        updateTemplateDto,
        entityManager,
      )

      // 3. Actualizar relaciones de atributos si se proporcionaron
      if (updateTemplateDto.atributeIds !== undefined) {
        await this.updateRelationTemplateToAttributes(
          id,
          updateTemplateDto.atributeIds,
          entityManager,
        )
      }

      // 4. Obtener la plantilla actualizada con todas las relaciones
      const finalTemplate = await this.templateRepository.findById(id)

      return updatedResponse({
        resource: 'templates',
        message: 'Plantilla actualizada exitosamente',
        data: finalTemplate,
      })
    })
  }

  async hardDelete(id: string): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const findResponse = await this.templateRepository.findById(id)

      if (!findResponse) {
        throw new NotFoundException({
          message: 'No se pudo encontrar la plantilla',
        })
      }

      await this.templateRepository.hardDelete(id, entityManager)

      return deletedResponse({
        resource: 'templates',
        message: 'Plantilla eliminada exitosamente',
      })
    })
  }
}
