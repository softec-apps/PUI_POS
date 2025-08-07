import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortEstablishmentDto,
  FilterEstablishmentDto,
} from '@/modules/establishment/dto/query-establishment.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Establishment } from '@/modules/establishment/domain/establishment'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { FindOptionsWhere, Repository, In, EntityManager, ILike } from 'typeorm'
import { EstablishmentRepository } from '@/modules/establishment/infrastructure/persistence/establishment.repository'
import { EstablishmentEntity } from '@/modules/establishment/infrastructure/persistence/relational/entities/establishment.entity'
import { EstablishmentMapper } from '@/modules/establishment/infrastructure/persistence/relational/mappers/establishment.mapper'

@Injectable()
export class EstablishmentRelationalRepository
  implements EstablishmentRepository
{
  constructor(
    @InjectRepository(EstablishmentEntity)
    private readonly establishmentRepository: Repository<EstablishmentEntity>,
  ) {}

  async create(
    data: Establishment,
    entityManager?: EntityManager,
  ): Promise<Establishment> {
    const repository = entityManager
      ? entityManager.getRepository(EstablishmentEntity)
      : this.establishmentRepository

    const persistenceModel = EstablishmentMapper.toPersistence(data)

    const newEntity = await repository.save(repository.create(persistenceModel))

    return EstablishmentMapper.toDomain(newEntity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterEstablishmentDto | null
    sortOptions?: SortEstablishmentDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Establishment[]
    totalCount: number
    totalRecords: number
  }> {
    // 1. Construir filtro exacto (AND)
    let baseFilters: FindOptionsWhere<EstablishmentEntity> = {}

    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value !== undefined && value !== null,
      )

      if (filteredEntries.length > 0) {
        baseFilters = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof EstablishmentEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<EstablishmentEntity>)
      }
    }

    // 2. Construir búsqueda textual (OR)
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`
      // Array OR con campos a buscar
      const searchConditions = [{ companyName: ILike(searchTerm) }]

      // Combinar baseFilters (AND) con búsqueda textual (OR)
      // En TypeORM, se pasa un array para OR
      const whereClause: FindOptionsWhere<EstablishmentEntity>[] =
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
        this.establishmentRepository.find({
          skip: (paginationOptions.page - 1) * paginationOptions.limit,
          take: paginationOptions.limit,
          where: whereClause,
          order: orderClause,
          withDeleted: true,
        }),
        this.establishmentRepository.count({
          where: whereClause,
          withDeleted: true,
        }),
        this.establishmentRepository.count({
          withDeleted: true,
        }),
      ])

      return {
        data: entities.map(EstablishmentMapper.toDomain),
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
        this.establishmentRepository.find({
          skip: (paginationOptions.page - 1) * paginationOptions.limit,
          take: paginationOptions.limit,
          where: whereClause,
          order: orderClause,
          withDeleted: true,
        }),
        this.establishmentRepository.count({
          where: whereClause,
          withDeleted: true,
        }),
        this.establishmentRepository.count({
          withDeleted: true,
        }),
      ])

      return {
        data: entities.map(EstablishmentMapper.toDomain),
        totalCount,
        totalRecords,
      }
    }
  }

  async findById(
    id: Establishment['id'],
  ): Promise<NullableType<Establishment>> {
    const entity = await this.establishmentRepository.findOne({
      where: { id: String(id) },
    })

    return entity ? EstablishmentMapper.toDomain(entity) : null
  }

  async findByIds(ids: Establishment['id'][]): Promise<Establishment[]> {
    const entities = await this.establishmentRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })

    return entities.map((user) => EstablishmentMapper.toDomain(user))
  }

  async findByField<K extends keyof Establishment>(
    field: K,
    value: Establishment[K],
  ): Promise<NullableType<Establishment>> {
    if (!value) return null

    const entity = await this.establishmentRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: true,
    })

    return entity ? EstablishmentMapper.toDomain(entity) : null
  }

  async update(
    id: Establishment['id'],
    payload: Partial<Establishment>,
    entityManager: EntityManager,
  ): Promise<Establishment> {
    const repository = entityManager.getRepository(EstablishmentEntity)

    const entity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!entity) throw new Error('Establishment not found')

    const updatedEntity = await repository.save(
      repository.create(
        EstablishmentMapper.toPersistence({
          ...EstablishmentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    )

    return EstablishmentMapper.toDomain(updatedEntity)
  }

  async softDelete(
    id: Establishment['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(EstablishmentEntity)
    await repository.softDelete(id)
  }

  async restore(
    id: Establishment['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(EstablishmentEntity)
    await repository.restore(id)
  }

  async hardDelete(
    id: Establishment['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(EstablishmentEntity)
    await repository.delete(id)
  }
}
