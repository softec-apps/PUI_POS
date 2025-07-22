import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortCategoryDto,
  FilterCategoryDto,
} from '@/modules/categories/dto/query-category.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Category } from '@/modules/categories/domain/category'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { FindOptionsWhere, Repository, In, EntityManager, ILike } from 'typeorm'
import { CategoryRepository } from '@/modules/categories/infrastructure/persistence/category.repository'
import { CategoryMapper } from '@/modules/categories/infrastructure/persistence/relational/mappers/category.mapper'
import { CategoryEntity } from '@/modules/categories/infrastructure/persistence/relational/entities/category.entity'

@Injectable()
export class CategoriesRelationalRepository implements CategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(
    data: Category,
    entityManager?: EntityManager,
  ): Promise<Category> {
    const repository = entityManager
      ? entityManager.getRepository(CategoryEntity)
      : this.categoryRepository

    const persistenceModel = CategoryMapper.toPersistence(data)

    const newEntity = await repository.save(repository.create(persistenceModel))

    return CategoryMapper.toDomain(newEntity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterCategoryDto | null
    sortOptions?: SortCategoryDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Category[]
    totalCount: number // Total con filtros (para paginación)
    totalRecords: number // Total sin filtros (estadísticas generales)
  }> {
    let whereClause:
      | FindOptionsWhere<CategoryEntity>
      | FindOptionsWhere<CategoryEntity>[] = {}

    // Aplicar filtros
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        whereClause = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof CategoryEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<CategoryEntity>)
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
        whereClause = [
          { name: ILike(searchTerm) },
          { description: ILike(searchTerm) },
        ]
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
      this.categoryRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
      }),
      // 2. Total CON filtros (para paginación)
      this.categoryRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      // 3. Total SIN filtros (estadísticas brutas)
      this.categoryRepository.count({
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(CategoryMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto
    }
  }

  async findById(id: Category['id']): Promise<NullableType<Category>> {
    const entity = await this.categoryRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    return entity ? CategoryMapper.toDomain(entity) : null
  }

  async findByIds(ids: Category['id'][]): Promise<Category[]> {
    const entities = await this.categoryRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })

    return entities.map((user) => CategoryMapper.toDomain(user))
  }

  async findByField<K extends keyof Category>(
    field: K,
    value: Category[K],
    options: { withDeleted?: boolean } = { withDeleted: false },
  ): Promise<NullableType<Category>> {
    if (!value) return null

    const entity = await this.categoryRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: options.withDeleted,
    })

    return entity ? CategoryMapper.toDomain(entity) : null
  }

  async update(
    id: Category['id'],
    payload: Partial<Category>,
    entityManager: EntityManager,
  ): Promise<Category> {
    const repository = entityManager.getRepository(CategoryEntity)

    const existingEntity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!existingEntity) throw new Error('Category not found')

    const updatedEntity = await repository.save(
      repository.create({
        ...existingEntity,
        ...payload,
      }),
    )

    return CategoryMapper.toDomain(updatedEntity)
  }

  async softDelete(
    id: Category['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(CategoryEntity)
    await repository.softDelete(id)
  }

  async restore(
    id: Category['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(CategoryEntity)
    await repository.restore(id)
  }

  async hardDelete(
    id: Category['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(CategoryEntity)
    await repository.delete(id)
  }
}
