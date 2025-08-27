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
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Injectable()
export class KardexRelationalRepository implements KardexRepository {
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

  async bulkCreate(
    data: Partial<Kardex>[],
    entityManager: EntityManager,
  ): Promise<Kardex[]> {
    const repository = entityManager.getRepository(KardexEntity)

    const persistenceModels = data.map((item) =>
      KardexMapper.toPersistence(item as Kardex),
    )

    const entities = repository.create(persistenceModels)
    const savedEntities = await repository.save(entities)

    return savedEntities.map(KardexMapper.toDomain)
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
    let baseFilters: FindOptionsWhere<KardexEntity> = {}

    // Aplicar filtros
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        baseFilters = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof KardexEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<KardexEntity>)
      }
    }

    // 2. Construir búsqueda textual (OR)
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`
      // Array OR con campos a buscar
      const searchConditions = [{ reason: ILike(searchTerm) }]

      // Combinar baseFilters (AND) con búsqueda textual (OR)
      // En TypeORM, se pasa un array para OR
      const whereClause: FindOptionsWhere<KardexEntity>[] =
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
        this.KardexRepository.find({
          skip: (paginationOptions.page - 1) * paginationOptions.limit,
          take: paginationOptions.limit,
          where: whereClause,
          order: orderClause,
          withDeleted: true,
          relations: [PATH_SOURCE.PRODUCT, PATH_SOURCE.USER],
        }),
        this.KardexRepository.count({
          where: whereClause,
          withDeleted: true,
        }),
        this.KardexRepository.count({
          withDeleted: true,
        }),
      ])

      return {
        data: entities.map(KardexMapper.toDomain),
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
        this.KardexRepository.find({
          skip: (paginationOptions.page - 1) * paginationOptions.limit,
          take: paginationOptions.limit,
          where: whereClause,
          order: orderClause,
          withDeleted: true,
          relations: [PATH_SOURCE.PRODUCT, PATH_SOURCE.USER],
        }),
        this.KardexRepository.count({
          where: whereClause,
          withDeleted: true,
        }),
        this.KardexRepository.count({
          withDeleted: true,
        }),
      ])

      return {
        data: entities.map(KardexMapper.toDomain),
        totalCount,
        totalRecords,
      }
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
    // PASO 1: Obtener TODOS los registros sin filtros, solo ordenados
    const allEntities = await this.KardexRepository.find({
      order: {
        productId: 'ASC',
        createdAt: 'DESC',
      },
      withDeleted: true,
      relations: [PATH_SOURCE.USER, PATH_SOURCE.PRODUCT],
    })

    // PASO 2: Procesar en memoria para obtener solo el último registro por producto
    const latestByProduct = new Map<string, KardexEntity>()

    allEntities.forEach((entity) => {
      if (!latestByProduct.has(entity.product.id))
        latestByProduct.set(entity.product.id, entity)
    })

    let latestEntities = Array.from(latestByProduct.values())

    // PASO 3: Aplicar filtros DESPUÉS de obtener los últimos registros
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value !== undefined && value !== null,
      )

      if (filteredEntries.length > 0) {
        latestEntities = latestEntities.filter((entity) => {
          return filteredEntries.every(([key, value]) => {
            const entityValue = entity[key as keyof KardexEntity]
            return entityValue === value
          })
        })
      }
    }

    // PASO 4: Aplicar búsqueda DESPUÉS de filtros
    if (searchOptions?.trim()) {
      const searchTerm = searchOptions.trim().toLowerCase()
      latestEntities = latestEntities.filter((entity) =>
        entity.reason?.toLowerCase().includes(searchTerm),
      )
    }

    // PASO 5: Aplicar ordenamiento (CORREGIDO)
    // Construir orderClause igual que en findManyWithPagination

    console.log('DSD', sortOptions)
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
        let aValue: any
        let bValue: any

        // Si es un campo de relación (ej: product.name), acceder correctamente
        if (field.includes('.')) {
          const [relation, relationField] = field.split('.')
          aValue = (a as any)[relation]?.[relationField]
          bValue = (b as any)[relation]?.[relationField]
        } else {
          // Campo directo de la entidad
          aValue = a[field as keyof KardexEntity]
          bValue = b[field as keyof KardexEntity]
        }

        // Manejar valores null/undefined
        if (aValue == null && bValue == null) continue
        if (aValue == null) return direction === 'ASC' ? 1 : -1
        if (bValue == null) return direction === 'ASC' ? -1 : 1

        // Convertir a string para comparación consistente si es necesario
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) return direction === 'ASC' ? -1 : 1
        if (aValue > bValue) return direction === 'ASC' ? 1 : -1
      }
      return 0
    })

    // PASO 6: Aplicar paginación manual
    const startIndex = (paginationOptions.page - 1) * paginationOptions.limit
    const endIndex = startIndex + paginationOptions.limit
    const paginatedEntities = latestEntities.slice(startIndex, endIndex)

    // PASO 7: Calcular totales
    const totalCount = latestEntities.length // Total con filtros aplicados

    // Total sin filtros: productos únicos en toda la tabla
    const allEntitiesForCount = await this.KardexRepository.find({
      select: ['productId'],
      withDeleted: true,
    })
    const uniqueProducts = new Set(allEntitiesForCount.map((e) => e.productId))
    const totalRecords = uniqueProducts.size

    return {
      data: paginatedEntities.map(KardexMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto (productos únicos)
    }
  }

  async findById(id: Kardex['id']): Promise<NullableType<Kardex>> {
    const entity = await this.KardexRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
      relations: [PATH_SOURCE.USER, PATH_SOURCE.PRODUCT],
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
