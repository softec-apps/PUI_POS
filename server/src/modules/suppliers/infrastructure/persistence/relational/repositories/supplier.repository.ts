import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  SortSupplierDto,
  FilterSupplierDto,
} from '@/modules/suppliers/dto/query-supplier.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { FindOptionsWhere, Repository, In, EntityManager, ILike } from 'typeorm'
import { SupplierRepository } from '@/modules/suppliers/infrastructure/persistence/supplier.repository'
import { SupplierMapper } from '@/modules/suppliers/infrastructure/persistence/relational/mappers/supplier.mapper'
import { SupplierEntity } from '@/modules/suppliers/infrastructure/persistence/relational/entities/supplier.entity'

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

    // Aplicar filtros
    if (filterOptions) {
      const filteredEntries = Object.entries(filterOptions).filter(
        ([_, value]) => value !== undefined && value !== null,
      )
      if (filteredEntries.length > 0) {
        whereClause = filteredEntries.reduce((acc, [key, value]) => {
          acc[key as keyof SupplierEntity] = value as any
          return acc
        }, {} as FindOptionsWhere<SupplierEntity>)
      }
    }

    // Aplicar búsqueda
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`
      if (Array.isArray(whereClause) || Object.keys(whereClause).length > 0) {
        whereClause = [
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            ruc: ILike(searchTerm),
          },
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            legalName: ILike(searchTerm),
          },
          {
            ...(Array.isArray(whereClause) ? whereClause[0] : whereClause),
            commercialName: ILike(searchTerm),
          },
        ]
      } else {
        whereClause = [
          { ruc: ILike(searchTerm) },
          { legalName: ILike(searchTerm) },
          { commercialName: ILike(searchTerm) },
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
      this.supplierRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
      }),
      // 2. Total CON filtros (para paginación)
      this.supplierRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      // 3. Total SIN filtros (estadísticas brutas)
      this.supplierRepository.count({
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(SupplierMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto
    }
  }

  async findById(id: Supplier['id']): Promise<NullableType<Supplier>> {
    const entity = await this.supplierRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
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

    const updatedEntity = await repository.save(
      repository.create({
        ...existingEntity,
        ...payload,
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
