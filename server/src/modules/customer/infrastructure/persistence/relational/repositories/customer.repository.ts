import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortCustomerDto,
  FilterCustomerDto,
} from '@/modules/customer/dto/query-customer.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Customer } from '@/modules/customer/domain/customer'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { FindOptionsWhere, Repository, In, EntityManager, ILike } from 'typeorm'
import { CustomerRepository } from '@/modules/customer/infrastructure/persistence/customer.repository'
import { CustomerMapper } from '@/modules/customer/infrastructure/persistence/relational/mappers/customer.mapper'
import { CustomerEntity } from '@/modules/customer/infrastructure/persistence/relational/entities/customer.entity'

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

    // Aplicar filtros
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        whereClause = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof CustomerEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<CustomerEntity>)
      }
    }

    // Aplicar búsqueda
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`
      if (Array.isArray(whereClause) || Object.keys(whereClause).length > 0) {
        whereClause = [
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            firstName: ILike(searchTerm),
          },
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            lastName: ILike(searchTerm),
          },
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            identificationNumber: ILike(searchTerm),
          },
        ]
      } else {
        whereClause = [
          { firstName: ILike(searchTerm) },
          { lastName: ILike(searchTerm) },
          { identificationNumber: ILike(searchTerm) },
        ]
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
      this.customerRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
      }),
      // 2. Total CON filtros (para paginación)
      this.customerRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      // 3. Total SIN filtros (estadísticas brutas)
      this.customerRepository.count({
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(CustomerMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto
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
