import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortAtributeDto,
  FilterAtributeDto,
} from '@/modules/atributes/dto/query-atribute.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Atribute } from '@/modules/atributes/domain/atribute'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import {
  FindOptionsWhere,
  Repository,
  In,
  Like,
  EntityManager,
  ILike,
} from 'typeorm'
import { AtributeRepository } from '@/modules/atributes/infrastructure/persistence/atribute.repository'
import { AtributeMapper } from '@/modules/atributes/infrastructure/persistence/relational/mappers/atributes.mapper'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'

@Injectable()
export class AtributesRelationalRepository implements AtributeRepository {
  constructor(
    @InjectRepository(AtributeEntity)
    private readonly atributeRepository: Repository<AtributeEntity>,
  ) {}

  async create(data: Atribute): Promise<Atribute> {
    const persistenceModel = AtributeMapper.toPersistence(data)
    const newEntity = await this.atributeRepository.save(
      this.atributeRepository.create(persistenceModel),
    )
    return AtributeMapper.toDomain(newEntity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterAtributeDto | null
    sortOptions?: SortAtributeDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Atribute[]
    totalCount: number // Total con filtros (para paginación)
    totalRecords: number // Total sin filtros (estadísticas generales)
  }> {
    let whereClause:
      | FindOptionsWhere<AtributeEntity>
      | FindOptionsWhere<AtributeEntity>[] = {}

    // Aplicar filtros
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        whereClause = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof AtributeEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<AtributeEntity>)
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
      this.atributeRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
      }),
      // 2. Total CON filtros (para paginación)
      this.atributeRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      // 3. Total SIN filtros (estadísticas brutas)
      this.atributeRepository.count({
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(AtributeMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto
    }
  }

  async findById(id: Atribute['id']): Promise<NullableType<Atribute>> {
    const entity = await this.atributeRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    return entity ? AtributeMapper.toDomain(entity) : null
  }

  async findByIds(ids: Atribute['id'][]): Promise<NullableType<Atribute[]>> {
    const entities = await this.atributeRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })
    return entities.map((entity) => AtributeMapper.toDomain(entity))
  }

  async findByField<K extends keyof Atribute>(
    field: K,
    value: Atribute[K],
  ): Promise<NullableType<Atribute>> {
    if (!value) return null

    const entity = await this.atributeRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: true,
    })

    return entity ? AtributeMapper.toDomain(entity) : null
  }

  async update(
    id: Atribute['id'],
    payload: Partial<Atribute>,
    entityManager: EntityManager,
  ): Promise<Atribute> {
    const repository = entityManager.getRepository(AtributeEntity)

    const existingEntity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!existingEntity) throw new Error('Atribute not found')

    const updateData: Partial<AtributeEntity> = {
      ...existingEntity,
      ...payload,
      options: payload.options === null ? undefined : payload.options,
    }

    const updatedEntity = await repository.save(updateData)

    return AtributeMapper.toDomain(updatedEntity)
  }

  async hardDelete(
    id: Atribute['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(AtributeEntity)
    await repository.delete(id)
  }
}
