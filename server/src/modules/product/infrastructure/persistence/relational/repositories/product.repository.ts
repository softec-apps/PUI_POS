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
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.supplier', 'supplier')

    // 1️⃣ Filtros exactos (AND)
    if (filterOptions) {
      for (const [key, value] of Object.entries(filterOptions)) {
        if (value !== undefined && value !== null) {
          query.andWhere(`product.${key} = :${key}`, { [key]: value })
        }
      }
    }

    // 2️⃣ Búsqueda textual (OR)
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`
      query.andWhere(
        `(LOWER(product.name) ILIKE :searchTerm OR 
        LOWER(product.code) ILIKE :searchTerm OR 
        LOWER(product.description) ILIKE :searchTerm OR 
        LOWER(product.sku) ILIKE :searchTerm OR 
        LOWER(product.barCode) ILIKE :searchTerm OR 
        LOWER(category.name) ILIKE :searchTerm)`,
        { searchTerm },
      )
    }

    // 3️⃣ Ordenamiento
    if (sortOptions?.length) {
      for (const sort of sortOptions) {
        query.addOrderBy(
          `product.${sort.orderBy}`,
          sort.order.toUpperCase() as 'ASC' | 'DESC',
        )
      }
    } else {
      query.addOrderBy('product.createdAt', 'DESC')
    }

    // 4️⃣ Paginación
    query.skip((paginationOptions.page - 1) * paginationOptions.limit)
    query.take(paginationOptions.limit)

    // 5️⃣ Ejecutar consulta y contar
    const [entities, totalCount] = await query.getManyAndCount()
    const totalRecords = await this.productRepository.count({
      withDeleted: true,
    })

    return {
      data: entities.map(ProductMapper.toDomain),
      totalCount,
      totalRecords,
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
