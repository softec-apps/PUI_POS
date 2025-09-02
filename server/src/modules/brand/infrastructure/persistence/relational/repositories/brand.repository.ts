import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortBrandDto,
  FilterBrandDto,
} from '@/modules/brand/dto/query-brand.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Brand } from '@/modules/brand/domain/brand'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import {
  FindOptionsWhere,
  Repository,
  In,
  EntityManager,
  ILike,
  MoreThanOrEqual,
  LessThanOrEqual,
  Between,
} from 'typeorm'
import { BrandRepository } from '@/modules/brand/infrastructure/persistence/brand.repository'
import { BrandMapper } from '@/modules/brand/infrastructure/persistence/relational/mappers/brand.mapper'
import { BrandEntity } from '@/modules/brand/infrastructure/persistence/relational/entities/brand.entity'
import { DateRangeDto } from '@/utils/dto/DateRangeDto'

@Injectable()
export class BrandRelationalRepository implements BrandRepository {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
  ) {}

  async create(data: Brand, entityManager?: EntityManager): Promise<Brand> {
    const repository = entityManager
      ? entityManager.getRepository(BrandEntity)
      : this.brandRepository

    const persistenceModel = BrandMapper.toPersistence(data)

    const newEntity = await repository.save(repository.create(persistenceModel))

    return BrandMapper.toDomain(newEntity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterBrandDto | null
    sortOptions?: SortBrandDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Brand[]
    totalCount: number // Total con filtros (para paginación)
    totalRecords: number // Total sin filtros (estadísticas generales)
  }> {
    let whereClause:
      | FindOptionsWhere<BrandEntity>
      | FindOptionsWhere<BrandEntity>[] = {}

    const buildDateFilter = (dateRange: DateRangeDto | null | undefined) => {
      if (!dateRange) return undefined

      const { startDate, endDate } = dateRange

      // Si ambas fechas están presentes
      if (startDate && endDate)
        return Between(new Date(startDate), new Date(endDate))

      // Solo fecha de inicio
      if (startDate) return MoreThanOrEqual(new Date(startDate))

      // Solo fecha de fin
      if (endDate) return LessThanOrEqual(new Date(endDate))

      return undefined
    }

    // Aplicar filtros
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        ([_, value]) => value !== undefined && value !== null,
      )

      if (filteredEntries.length > 0) {
        whereClause = filteredEntries.reduce((acc, [key, value]) => {
          if (['createdAt', 'updatedAt', 'deletedAt'].includes(key)) {
            const dateFilter = buildDateFilter(value as DateRangeDto)
            if (dateFilter) acc[key as keyof BrandEntity] = dateFilter as any
          } else {
            // Filtros normales (statusId, etc.)
            acc[key as keyof BrandEntity] = value as any
          }
          return acc
        }, {} as FindOptionsWhere<BrandEntity>)
      }
    }

    // Aplicar búsqueda (mantener lógica existente)
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`

      const baseSearchConditions = [
        { name: ILike(searchTerm) },
        { description: ILike(searchTerm) },
      ]

      if (Array.isArray(whereClause) || Object.keys(whereClause).length > 0) {
        const baseWhere = Array.isArray(whereClause)
          ? whereClause[0]
          : whereClause
        whereClause = baseSearchConditions.map((condition) => ({
          ...baseWhere,
          ...condition,
        }))
      } else {
        whereClause = baseSearchConditions.map((condition) => ({
          ...condition,
        }))
      }
    } else {
      // Si no hay búsqueda, agregar la condición de exclusión del roleId = 1
      if (Array.isArray(whereClause)) {
        whereClause = whereClause.map((clause) => ({
          ...clause,
        }))
      } else if (Object.keys(whereClause).length > 0) {
        whereClause = {
          ...whereClause,
        }
      } else {
        whereClause = {}
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
      // 1. Datos paginados (con filtros y excluir roleId = 1)
      this.brandRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
      }),
      // 2. Total CON filtros (para paginación, excluir roleId = 1)
      this.brandRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      // 3. Total SIN filtros (estadísticas brutas, excluir roleId = 1)
      this.brandRepository.count({
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(BrandMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto (sin roleId = 1)
    }
  }

  async findById(id: Brand['id']): Promise<NullableType<Brand>> {
    const entity = await this.brandRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    return entity ? BrandMapper.toDomain(entity) : null
  }

  async findByIds(ids: Brand['id'][]): Promise<Brand[]> {
    const entities = await this.brandRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })

    return entities.map((user) => BrandMapper.toDomain(user))
  }

  async findByField<K extends keyof Brand>(
    field: K,
    value: Brand[K],
  ): Promise<NullableType<Brand>> {
    if (!value) return null

    const entity = await this.brandRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: true,
    })

    return entity ? BrandMapper.toDomain(entity) : null
  }

  async update(
    id: Brand['id'],
    payload: Partial<Brand>,
    entityManager: EntityManager,
  ): Promise<Brand> {
    const repository = entityManager.getRepository(BrandEntity)

    const existingEntity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!existingEntity) throw new Error('Brand not found')

    const updatedEntity = await repository.save(
      repository.create({
        ...existingEntity,
        ...payload,
      }),
    )

    return BrandMapper.toDomain(updatedEntity)
  }

  async softDelete(
    id: Brand['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(BrandEntity)
    await repository.softDelete(id)
  }

  async restore(id: Brand['id'], entityManager: EntityManager): Promise<void> {
    const repository = entityManager.getRepository(BrandEntity)
    await repository.restore(id)
  }

  async hardDelete(
    id: Brand['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(BrandEntity)
    await repository.delete(id)
  }
}
