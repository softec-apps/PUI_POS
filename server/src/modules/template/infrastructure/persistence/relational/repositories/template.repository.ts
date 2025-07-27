import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortTemplateDto,
  FilterTemplateDto,
} from '@/modules/template/dto/query-template.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Template } from '@/modules/template/domain/template'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { FindOptionsWhere, Repository, In, EntityManager, ILike } from 'typeorm'
import { TemplateRepository } from '@/modules/template/infrastructure/persistence/template.repository'
import { TemplateMapper } from '@/modules/template/infrastructure/persistence/relational/mappers/template.mapper'
import { TemplateEntity } from '@/modules/template/infrastructure/persistence/relational/entities/template.entity'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'
import { AtributeMapper } from '@/modules/atributes/infrastructure/persistence/relational/mappers/atributes.mapper'
import { AtributesRelationalRepository } from '@/modules/atributes/infrastructure/persistence/relational/repositories/atribute.repository'
import { Category } from '@/modules/categories/domain/category'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Injectable()
export class TemplateRelationalRepository implements TemplateRepository {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly templateRepository: Repository<TemplateEntity>,
    @InjectRepository(AtributeEntity)
    private readonly atributesRepository: AtributesRelationalRepository,
  ) {}

  async createTemplateWithoutRelaction(
    data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>,
    entityManager: EntityManager,
  ): Promise<Template> {
    const persistenceModel = TemplateMapper.toPersistence(data as Template)

    // Usamos el EntityManager si está disponible, sino el repositorio normal
    const repository = entityManager
      ? entityManager.getRepository(TemplateEntity)
      : this.templateRepository

    const newEntity = await repository.save(repository.create(persistenceModel))
    return TemplateMapper.toDomain(newEntity)
  }

  async createRelationTemplateToAtributes(
    templateId: string,
    atributeIds: string[],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(TemplateEntity)

    // Cargamos template sin relaciones para optimizar
    const template = await repository.findOneBy({ id: templateId })

    if (!template) throw new NotFoundException('Template no encontrado')

    // Validación de atributos
    const atributes = await this.atributesRepository.findByIds(atributeIds)
    if (atributes?.length !== atributeIds.length)
      throw new NotFoundException('Algunos atributos no fueron encontrados')

    // Asignamos nuevos atributos
    template.atribute = atributes.map(AtributeMapper.toPersistence)

    await repository.save(template)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterTemplateDto | null
    sortOptions?: SortTemplateDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Template[]
    totalCount: number // Total con filtros (para paginación)
    totalRecords: number // Total sin filtros (estadísticas generales)
  }> {
    let whereClause:
      | FindOptionsWhere<TemplateEntity>
      | FindOptionsWhere<TemplateEntity>[] = {}

    // Aplicar filtros
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        whereClause = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof TemplateEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<TemplateEntity>)
      }
    }

    // Aplicar búsqueda
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`
      if (Array.isArray(whereClause) || Object.keys(whereClause).length > 0) {
        whereClause = [
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            name: ILike(searchTerm),
          },
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            description: ILike(searchTerm),
          },
        ]
      } else {
        whereClause = [{ name: ILike(searchTerm) }]
      }
    }

    const orderClause = sortOptions?.length
      ? sortOptions.reduce(
          (acc, sort) => {
            acc[sort.orderBy] = sort.order
            return acc
          },
          {} as Record<string, any>,
        )
      : { createdAt: 'DESC' }

    // Consultas en paralelo para mejor rendimiento
    const [entities, totalCount, totalRecords] = await Promise.all([
      // 1. Datos paginados (con filtros)
      this.templateRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
        relations: [PATH_SOURCE.CATEGORY, PATH_SOURCE.ATRIBUTE],
      }),
      // 2. Total CON filtros (para paginación)
      this.templateRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      // 3. Total SIN filtros (estadísticas brutas)
      this.templateRepository.count({
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(TemplateMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto
    }
  }

  async findById(id: Template['id']): Promise<Template | null> {
    const entity = await this.templateRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
      relations: ['category', 'atributes'],
    })
    return entity ? TemplateMapper.toDomain(entity) : null
  }

  async findByIds(ids: Template['id'][]): Promise<Template[]> {
    const entities = await this.templateRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })

    return entities.map((entity) => TemplateMapper.toDomain(entity))
  }

  async findByField<K extends keyof Template>(
    field: K,
    value: K extends 'category' ? Category['id'] : Template[K],
  ): Promise<NullableType<Template>> {
    if (!value) return null

    // Preparar las opciones de búsqueda
    const findOptions: {
      where: FindOptionsWhere<TemplateEntity>
      relations?: string[]
    } = {
      where: {},
    }

    // Manejo especial para búsqueda por categoría
    if (field === 'category') {
      findOptions.where = {
        category: {
          id: value as string,
        },
      }
      findOptions.relations = ['category']
    } else {
      findOptions.where = {
        [field]: value,
      } as FindOptionsWhere<TemplateEntity>
    }

    const entity = await this.templateRepository.findOne({
      ...findOptions,
      withDeleted: true,
    })

    return entity ? TemplateMapper.toDomain(entity) : null
  }

  async deleteRelationTemplateToAttributes(
    templateId: string,
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(TemplateEntity)

    // Cargar el template con sus relaciones
    const template = await repository.findOne({
      where: { id: templateId },
      relations: ['atributes'],
    })

    if (!template) throw new NotFoundException('Template no encontrado')

    // Limpiar las relaciones de atributos
    template.atribute = []

    // Guardar el template sin atributos (esto eliminará las relaciones)
    await repository.save(template)
  }

  async update(
    id: Template['id'],
    payload: Partial<Template>,
    entityManager: EntityManager,
  ): Promise<Template> {
    const repository = entityManager.getRepository(TemplateEntity)

    const entity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!entity) throw new Error('Template not found')

    const updatedEntity = await repository.save(
      repository.create(
        TemplateMapper.toPersistence({
          ...TemplateMapper.toDomain(entity),
          ...payload,
        }),
      ),
    )

    return TemplateMapper.toDomain(updatedEntity)
  }

  async softDelete(
    id: Template['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(TemplateEntity)
    await repository.softDelete(id)
  }

  async hardDelete(id: string, entityManager: EntityManager): Promise<void> {
    const repository = entityManager.getRepository(TemplateEntity)
    await repository.delete(id)
  }
}
