import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortSupplierDto,
  FilterSupplierDto,
} from '@/modules/suppliers/dto/query-supplier.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import {
  FindOptionsWhere,
  Repository,
  In,
  EntityManager,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm'
import { SupplierRepository } from '@/modules/suppliers/infrastructure/persistence/supplier.repository'
import { SupplierMapper } from '@/modules/suppliers/infrastructure/persistence/relational/mappers/supplier.mapper'
import { SupplierEntity } from '@/modules/suppliers/infrastructure/persistence/relational/entities/supplier.entity'
import { DateRangeDto } from '@/utils/dto/DateRangeDto'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Injectable()
export class SupplierRelationalRepository implements SupplierRepository {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly supplierRepository: Repository<SupplierEntity>,
  ) {}

  async create(
    data: Supplier,
    entityManager?: EntityManager,
  ): Promise<Supplier> {
    const repository = entityManager
      ? entityManager.getRepository(SupplierEntity)
      : this.supplierRepository

    const persistenceModel = SupplierMapper.toPersistence(data)

    const newEntity = await repository.save(repository.create(persistenceModel))

    return SupplierMapper.toDomain(newEntity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterSupplierDto | null
    sortOptions?: SortSupplierDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Supplier[]
    totalCount: number // Total con filtros (para paginación)
    totalRecords: number // Total sin filtros (estadísticas generales)
  }> {
    let whereClause:
      | FindOptionsWhere<SupplierEntity>
      | FindOptionsWhere<SupplierEntity>[] = {}

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
            if (dateFilter) acc[key as keyof SupplierEntity] = dateFilter as any
          } else {
            // Filtros normales (statusId, etc.)
            acc[key as keyof SupplierEntity] = value as any
          }
          return acc
        }, {} as FindOptionsWhere<SupplierEntity>)
      }
    }

    // Aplicar búsqueda (mantener lógica existente)
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`

      const baseSearchConditions = [
        { ruc: ILike(searchTerm) },
        { legalName: ILike(searchTerm) },
        { commercialName: ILike(searchTerm) },
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
      this.supplierRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
      }),
      this.supplierRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      this.supplierRepository.count({
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(SupplierMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto (sin roleId = 1)
    }
  }

  async findById(id: Supplier['id']): Promise<NullableType<Supplier>> {
    const entity = await this.supplierRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
      relations: {
        product: true,
      },
    })

    return entity ? SupplierMapper.toDomain(entity) : null
  }

  async findByIds(ids: Supplier['id'][]): Promise<Supplier[]> {
    const entities = await this.supplierRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })

    return entities.map((user) => SupplierMapper.toDomain(user))
  }

  async findByField<K extends keyof Supplier>(
    field: K,
    value: Supplier[K],
  ): Promise<NullableType<Supplier>> {
    if (!value) return null

    const entity = await this.supplierRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: true,
    })

    return entity ? SupplierMapper.toDomain(entity) : null
  }

  async update(
    id: Supplier['id'],
    payload: Partial<Supplier>,
    entityManager: EntityManager,
  ): Promise<Supplier> {
    const repository = entityManager.getRepository(SupplierEntity)

    const existingEntity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!existingEntity) throw new Error('Supplier not found')

    // ✅ Crear un payload sin la propiedad 'product' para evitar conflictos
    const { product, ...updatePayload } = payload

    const updatedEntity = await repository.save(
      repository.create({
        ...existingEntity,
        ...updatePayload,
      }),
    )

    return SupplierMapper.toDomain(updatedEntity)
  }

  async softDelete(
    id: Supplier['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(SupplierEntity)
    await repository.softDelete(id)
  }

  async restore(
    id: Supplier['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(SupplierEntity)
    await repository.restore(id)
  }

  async hardDelete(
    id: Supplier['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(SupplierEntity)
    await repository.delete(id)
  }
}
