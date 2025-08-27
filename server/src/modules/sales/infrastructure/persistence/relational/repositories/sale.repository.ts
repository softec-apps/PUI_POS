import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Sale } from '@/modules/sales/domain/sale'
import { NullableType } from '@/utils/types/nullable.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { SortSaleDto, FilterSaleDto } from '@/modules/sales/dto/query-sale.dto'
import { FindOptionsWhere, Repository, In, EntityManager, ILike } from 'typeorm'
import { SaleRepository } from '@/modules/sales/infrastructure/persistence/sale.repository'
import { SaleMapper } from '@/modules/sales/infrastructure/persistence/relational/mappers/sale.mapper'
import { SaleEntity } from '@/modules/sales/infrastructure/persistence/relational/entities/sale.entity'

@Injectable()
export class SaleRelationalRepository implements SaleRepository {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly saleRepository: Repository<SaleEntity>,
  ) {}

  async create(
    data: Omit<Sale, 'id' | 'createdAt'>,
    entityManager: EntityManager,
  ): Promise<Sale> {
    const repository = entityManager
      ? entityManager.getRepository(SaleEntity)
      : this.saleRepository

    const entity = repository.create(SaleMapper.toPersistence(data))
    await repository.save(entity)

    return SaleMapper.toDomain(entity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterSaleDto | null
    sortOptions?: SortSaleDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Sale[]
    totalCount: number
    totalRecords: number
  }> {
    let whereClause:
      | FindOptionsWhere<SaleEntity>
      | FindOptionsWhere<SaleEntity>[] = {}

    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        whereClause = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof SaleEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<SaleEntity>)
      }
    }

    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`
      if (Array.isArray(whereClause) || Object.keys(whereClause).length > 0) {
        whereClause = [
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            code: ILike(searchTerm),
          },
        ]
      } else {
        whereClause = [{ code: ILike(searchTerm) }]
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

    const [entities, totalCount, totalRecords] = await Promise.all([
      this.saleRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
        relations: {
          customer: true,
          items: {
            product: true,
          },
        },
      }),
      this.saleRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      this.saleRepository.count({ withDeleted: true }),
    ])

    return {
      data: entities.map(SaleMapper.toDomain),
      totalCount,
      totalRecords,
    }
  }

  async findById(id: Sale['id']): Promise<NullableType<Sale>> {
    const entity = await this.saleRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
      relations: {
        customer: true,
        items: {
          product: true,
        },
      },
    })
    return entity ? SaleMapper.toDomain(entity) : null
  }

  async findByIds(ids: Sale['id'][]): Promise<Sale[]> {
    const entities = await this.saleRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })
    return entities.map(SaleMapper.toDomain)
  }

  async findByField<K extends keyof Sale>(
    field: K,
    value: Sale[K] | string,
  ): Promise<NullableType<Sale>> {
    if (!value) return null

    const findOptions: {
      where: FindOptionsWhere<SaleEntity>
      relations?: string[]
    } = {
      where: {},
    }

    if (field === 'customer') {
      findOptions.where = { customer: { id: value as string } }
      findOptions.relations = [PATH_SOURCE.CUSTOMER]
    } else {
      findOptions.where = { [field]: value } as FindOptionsWhere<SaleEntity>
    }

    const entity = await this.saleRepository.findOne({
      ...findOptions,
      withDeleted: true,
    })

    return entity ? SaleMapper.toDomain(entity) : null
  }
}
