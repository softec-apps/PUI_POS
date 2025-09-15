import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortProductDto,
  FilterProductDto,
} from '@/modules/product/dto/query-product.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Product } from '@/modules/product/domain/product'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { FindOptionsWhere, Repository, In, EntityManager, ILike } from 'typeorm'
import { ProductRepository } from '@/modules/product/infrastructure/persistence/product.repository'
import { ProductMapper } from '@/modules/product/infrastructure/persistence/relational/mappers/product.mapper'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Injectable()
export class ProductRelationalRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create(data: Product, entityManager?: EntityManager): Promise<Product> {
    const repository = entityManager
      ? entityManager.getRepository(ProductEntity)
      : this.productRepository

    const persistenceModel = ProductMapper.toPersistence(data)

    const newEntity = await repository.save(repository.create(persistenceModel))

    return ProductMapper.toDomain(newEntity)
  }

  async bulkCreate(
    data: Partial<Product>[],
    entityManager: EntityManager,
  ): Promise<Product[]> {
    const repository = entityManager.getRepository(ProductEntity)

    const persistenceModels = data.map((item) =>
      ProductMapper.toPersistence(item as Product),
    )

    const entities = repository.create(persistenceModels)
    const savedEntities = await repository.save(entities)

    return savedEntities.map(ProductMapper.toDomain)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterProductDto | null
    sortOptions?: SortProductDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Product[]
    totalCount: number
    totalRecords: number
  }> {
    // 1. Construir filtro exacto (AND)
    let baseFilters: FindOptionsWhere<ProductEntity> = {}

    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        baseFilters = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof ProductEntity] = value
          return acc
        }, {} as FindOptionsWhere<ProductEntity>)
      }
    }

    // 2. Construir búsqueda textual (OR)
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`
      // Array OR con campos a buscar
      const searchConditions = [
        { code: ILike(searchTerm) },
        { name: ILike(searchTerm) },
        { description: ILike(searchTerm) },
        { sku: ILike(searchTerm) },
        { barCode: ILike(searchTerm) },
      ]

      // Combinar baseFilters (AND) con búsqueda textual (OR)
      // En TypeORM, se pasa un array para OR
      const whereClause: FindOptionsWhere<ProductEntity>[] =
        searchConditions.map((condition) => ({
          ...baseFilters,
          ...condition,
        }))

      // Preparar order
      const orderClause = sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => {
              acc[sort.orderBy] = sort.order
              return acc
            },
            {} as Record<string, any>,
          )
        : { createdAt: 'DESC' }

      // Ejecutar consulta con whereClause (array = OR entre cada objeto)
      const [entities, totalCount, totalRecords] = await Promise.all([
        this.productRepository.find({
          skip: (paginationOptions.page - 1) * paginationOptions.limit,
          take: paginationOptions.limit,
          where: whereClause,
          order: orderClause,
          withDeleted: true,
          relations: [
            PATH_SOURCE.CATEGORY,
            PATH_SOURCE.BRAND,
            PATH_SOURCE.SUPPLIER,
          ],
        }),
        this.productRepository.count({
          where: whereClause,
          withDeleted: true,
        }),
        this.productRepository.count({
          withDeleted: true,
        }),
      ])

      return {
        data: entities.map(ProductMapper.toDomain),
        totalCount,
        totalRecords,
      }
    } else {
      // Sin búsqueda textual: solo filtros exactos
      const whereClause = baseFilters

      const orderClause = sortOptions?.length
        ? sortOptions.reduce(
            (acc, sort) => {
              acc[sort.orderBy] = sort.order
              return acc
            },
            {} as Record<string, any>,
          )
        : { createdAt: 'DESC' }

      const [entities, totalCount, totalRecords] = await Promise.all([
        this.productRepository.find({
          skip: (paginationOptions.page - 1) * paginationOptions.limit,
          take: paginationOptions.limit,
          where: whereClause,
          order: orderClause,
          withDeleted: true,
          relations: [
            PATH_SOURCE.CATEGORY,
            PATH_SOURCE.BRAND,
            PATH_SOURCE.SUPPLIER,
          ],
        }),
        this.productRepository.count({
          where: whereClause,
          withDeleted: true,
        }),
        this.productRepository.count({
          withDeleted: true,
        }),
      ])

      return {
        data: entities.map(ProductMapper.toDomain),
        totalCount,
        totalRecords,
      }
    }
  }

  async findById(id: Product['id']): Promise<NullableType<Product>> {
    const entity = await this.productRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
      relations: [
        PATH_SOURCE.CATEGORY,
        PATH_SOURCE.BRAND,
        PATH_SOURCE.SUPPLIER,
        PATH_SOURCE.TEMPLATE,
      ],
    })

    return entity ? ProductMapper.toDomain(entity) : null
  }

  async findByIds(ids: Product['id'][]): Promise<Product[]> {
    const entities = await this.productRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })

    return entities.map((user) => ProductMapper.toDomain(user))
  }

  async findByField<K extends keyof Product>(
    field: K,
    value: Product[K],
  ): Promise<NullableType<Product>> {
    if (!value) return null

    const entity = await this.productRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: true,
    })

    return entity ? ProductMapper.toDomain(entity) : null
  }

  async update(
    id: Product['id'],
    payload: Partial<Product>,
    entityManager: EntityManager,
  ): Promise<Product> {
    const repository = entityManager.getRepository(ProductEntity)

    const entity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!entity) throw new Error('Product not found')

    const updatedEntity = await repository.save(
      repository.create(
        ProductMapper.toPersistence({
          ...ProductMapper.toDomain(entity),
          ...payload,
        }),
      ),
    )

    return ProductMapper.toDomain(updatedEntity)
  }

  async softDelete(
    id: Product['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(ProductEntity)
    await repository.softDelete(id)
  }

  async restore(
    id: Product['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(ProductEntity)
    await repository.restore(id)
  }

  async hardDelete(
    id: Product['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(ProductEntity)
    await repository.delete(id)
  }
}
