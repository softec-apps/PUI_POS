import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortCustomerDto,
  FilterCustomerDto,
} from '@/modules/customer/dto/query-customer.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Customer } from '@/modules/customer/domain/customer'
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
import { CustomerRepository } from '@/modules/customer/infrastructure/persistence/customer.repository'
import { CustomerMapper } from '@/modules/customer/infrastructure/persistence/relational/mappers/customer.mapper'
import { CustomerEntity } from '@/modules/customer/infrastructure/persistence/relational/entities/customer.entity'
import { DateRangeDto } from '@/utils/dto/DateRangeDto'

@Injectable()
export class CustomerRelationalRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async create(
    data: Customer,
    entityManager?: EntityManager,
  ): Promise<Customer> {
    const repository = entityManager
      ? entityManager.getRepository(CustomerEntity)
      : this.customerRepository
    const persistenceModel = CustomerMapper.toPersistence(data)
    const newEntity = await repository.save(repository.create(persistenceModel))
    return CustomerMapper.toDomain(newEntity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterCustomerDto | null
    sortOptions?: SortCustomerDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Customer[]
    totalCount: number // Total con filtros (para paginación)
    totalRecords: number // Total sin filtros (estadísticas generales)
  }> {
    let whereClause:
      | FindOptionsWhere<CustomerEntity>
      | FindOptionsWhere<CustomerEntity>[] = {}

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
            if (dateFilter) acc[key as keyof CustomerEntity] = dateFilter as any
          } else {
            // Filtros normales (roleId, statusId, etc.)
            acc[key as keyof CustomerEntity] = value as any
          }
          return acc
        }, {} as FindOptionsWhere<CustomerEntity>)
      }
    }

    // Aplicar búsqueda (mantener lógica existente)
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`

      const baseSearchConditions = [
        { identificationNumber: ILike(searchTerm) },
        { firstName: ILike(searchTerm) },
        { lastName: ILike(searchTerm) },
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
      this.customerRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
      }),
      // 2. Total CON filtros (para paginación, excluir roleId = 1)
      this.customerRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      // 3. Total SIN filtros (estadísticas brutas, excluir roleId = 1)
      this.customerRepository.count({
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(CustomerMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto (sin roleId = 1)
    }
  }

  async findById(id: Customer['id']): Promise<NullableType<Customer>> {
    const entity = await this.customerRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    return entity ? CustomerMapper.toDomain(entity) : null
  }

  async findByIds(ids: Customer['id'][]): Promise<Customer[]> {
    const entities = await this.customerRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })

    return entities.map((user) => CustomerMapper.toDomain(user))
  }

  async findByField<K extends keyof Customer>(
    field: K,
    value: Customer[K],
  ): Promise<NullableType<Customer>> {
    if (!value) return null

    const entity = await this.customerRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: true,
    })

    return entity ? CustomerMapper.toDomain(entity) : null
  }

  async update(
    id: Customer['id'],
    payload: Partial<Customer>,
    entityManager: EntityManager,
  ): Promise<Customer> {
    const repository = entityManager.getRepository(CustomerEntity)

    const existingEntity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!existingEntity) throw new Error('Customer not found')

    // Convert payload to persistence format and merge with existing entity
    const persistencePayload = CustomerMapper.toPersistence({
      ...CustomerMapper.toDomain(existingEntity),
      ...payload,
    } as Customer)

    // Fix: Use merge and save instead of create
    const mergedEntity = repository.merge(existingEntity, persistencePayload)
    const updatedEntity = await repository.save(mergedEntity)

    return CustomerMapper.toDomain(updatedEntity)
  }

  async softDelete(
    id: Customer['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(CustomerEntity)
    await repository.softDelete(id)
  }

  async restore(
    id: Customer['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(CustomerEntity)
    await repository.restore(id)
  }

  async hardDelete(
    id: Customer['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(CustomerEntity)
    await repository.delete(id)
  }
}
