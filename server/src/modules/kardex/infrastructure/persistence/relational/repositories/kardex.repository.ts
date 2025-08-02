import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortKardexDto,
  FilterKardexDto,
} from '@/modules/kardex/dto/query-kardex.dto'
import { Kardex } from '@/modules/kardex/domain/kardex'
import { NullableType } from '@/utils/types/nullable.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { FindOptionsWhere, Repository, In, EntityManager, ILike } from 'typeorm'
import { KardexRepository } from '@/modules/kardex/infrastructure/persistence/kardex.repository'
import { KardexMapper } from '@/modules/kardex/infrastructure/persistence/relational/mappers/kardex.mapper'
import { KardexEntity } from '@/modules/kardex/infrastructure/persistence/relational/entities/kardex.entity'

@Injectable()
export class kardexRelationalRepository implements KardexRepository {
  constructor(
    @InjectRepository(KardexEntity)
    private readonly KardexRepository: Repository<KardexEntity>,
  ) {}

  async create(data: Kardex, entityManager?: EntityManager): Promise<Kardex> {
    const repository = entityManager
      ? entityManager.getRepository(KardexEntity)
      : this.KardexRepository

    const persistenceModel = KardexMapper.toPersistence(data)

    const newEntity = await repository.save(repository.create(persistenceModel))

    return KardexMapper.toDomain(newEntity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterKardexDto | null
    sortOptions?: SortKardexDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Kardex[]
    totalCount: number // Total con filtros (para paginación)
    totalRecords: number // Total sin filtros (estadísticas generales)
  }> {
    let whereClause:
      | FindOptionsWhere<KardexEntity>
      | FindOptionsWhere<KardexEntity>[] = {}

    // Aplicar filtros
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        whereClause = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof KardexEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<KardexEntity>)
      }
    }

    // Aplicar búsqueda
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`
      if (Array.isArray(whereClause) || Object.keys(whereClause).length > 0) {
        whereClause = [
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            reason: ILike(searchTerm),
          },
        ]
      } else {
        whereClause = [{ reason: ILike(searchTerm) }]
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
      this.KardexRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
      }),
      // 2. Total CON filtros (para paginación)
      this.KardexRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      // 3. Total SIN filtros (estadísticas brutas)
      this.KardexRepository.count({
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(KardexMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto
    }
  }

  async findById(id: Kardex['id']): Promise<NullableType<Kardex>> {
    const entity = await this.KardexRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    return entity ? KardexMapper.toDomain(entity) : null
  }

  async findByIds(ids: Kardex['id'][]): Promise<Kardex[]> {
    const entities = await this.KardexRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })

    return entities.map((user) => KardexMapper.toDomain(user))
  }

  async findByField<K extends keyof Kardex>(
    field: K,
    value: Kardex[K],
  ): Promise<NullableType<Kardex>> {
    if (!value) return null

    const entity = await this.KardexRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: true,
    })

    return entity ? KardexMapper.toDomain(entity) : null
  }
}
