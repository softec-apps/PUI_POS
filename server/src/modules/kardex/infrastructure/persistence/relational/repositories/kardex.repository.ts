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

  async findLatestByProductWithPagination({
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
    // PASO 1: Obtener todos los registros y procesarlos en memoria para obtener el último por producto
    let whereClause:
      | FindOptionsWhere<KardexEntity>
      | FindOptionsWhere<KardexEntity>[] = {}

    // Aplicar filtros (MISMA lógica que el método original)
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        whereClause = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof KardexEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<KardexEntity>)
      }
    }

    // Aplicar búsqueda (MISMA lógica que el método original)
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

    // PASO 2: Obtener todos los registros filtrados ordenados por producto y fecha
    const allFilteredEntities = await this.KardexRepository.find({
      where: whereClause,
      order: {
        productId: 'ASC',
        createdAt: 'DESC',
      },
      withDeleted: true,
    })

    // PASO 3: Procesar en memoria para obtener solo el último registro por producto
    const latestByProduct = new Map<string, KardexEntity>()

    allFilteredEntities.forEach((entity) => {
      if (!latestByProduct.has(entity.productId)) {
        latestByProduct.set(entity.productId, entity)
      }
    })

    const latestEntities = Array.from(latestByProduct.values())

    // PASO 4: Aplicar ordenamiento (MISMA lógica que el método original)
    const orderClause = sortOptions?.length
      ? sortOptions.reduce(
          (acc, sort) => {
            acc[sort.orderBy] = sort.order
            return acc
          },
          {} as Record<string, any>,
        )
      : { createdAt: 'DESC' }

    // Ordenar los resultados según el orderClause
    latestEntities.sort((a, b) => {
      for (const [field, direction] of Object.entries(orderClause)) {
        const aValue = a[field as keyof KardexEntity]
        const bValue = b[field as keyof KardexEntity]

        // Manejar valores null/undefined
        if (aValue == null && bValue == null) continue
        if (aValue == null) return direction === 'ASC' ? -1 : 1
        if (bValue == null) return direction === 'ASC' ? 1 : -1

        if (aValue < bValue) return direction === 'ASC' ? -1 : 1
        if (aValue > bValue) return direction === 'ASC' ? 1 : -1
      }
      return 0
    })

    // PASO 5: Aplicar paginación manual
    const startIndex = (paginationOptions.page - 1) * paginationOptions.limit
    const endIndex = startIndex + paginationOptions.limit
    const paginatedEntities = latestEntities.slice(startIndex, endIndex)

    // PASO 6: Calcular totales (MISMA estructura que el método original)
    const totalCount = latestEntities.length // Total con filtros (productos únicos filtrados)

    // Total sin filtros: contar productos únicos en toda la tabla
    const allEntitiesForCount = await this.KardexRepository.find({
      select: ['productId'],
      withDeleted: true,
    })
    const uniqueProducts = new Set(allEntitiesForCount.map((e) => e.productId))
    const totalRecords = uniqueProducts.size

    return {
      data: paginatedEntities.map(KardexMapper.toDomain),
      totalCount, // Total filtrado (productos únicos)
      totalRecords, // Total absoluto (productos únicos)
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
