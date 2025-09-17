import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Sale } from '@/modules/sales/domain/sale'
import { NullableType } from '@/utils/types/nullable.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { SortSaleDto, FilterSaleDto } from '@/modules/sales/dto/query-sale.dto'
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
import { SaleRepository } from '@/modules/sales/infrastructure/persistence/sale.repository'
import { SaleMapper } from '@/modules/sales/infrastructure/persistence/relational/mappers/sale.mapper'
import { SaleEntity } from '@/modules/sales/infrastructure/persistence/relational/entities/sale.entity'
import { DateRangeDto } from '@/utils/dto/DateRangeDto'

@Injectable()
export class SaleRelationalRepository implements SaleRepository {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly saleRepository: Repository<SaleEntity>,
  ) {}

  async create(
    data: Omit<Sale, 'id' | 'createdAt'>,
    entityManager: EntityManager,
  ): Promise<Sale> {
    const repository = entityManager
      ? entityManager.getRepository(SaleEntity)
      : this.saleRepository

    const entity = repository.create(SaleMapper.toPersistence(data))
    await repository.save(entity)

    return SaleMapper.toDomain(entity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterSaleDto | null
    sortOptions?: SortSaleDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: Sale[]
    totalCount: number
    totalRecords: number
  }> {
    let whereClause:
      | FindOptionsWhere<SaleEntity>
      | FindOptionsWhere<SaleEntity>[] = {}

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
          if (['createdAt'].includes(key)) {
            const dateFilter = buildDateFilter(value as DateRangeDto)
            if (dateFilter) acc[key as keyof SaleEntity] = dateFilter as any
          } else {
            acc[key as keyof SaleEntity] = value as any
          }
          return acc
        }, {} as FindOptionsWhere<SaleEntity>)
      }
    }

    // Aplicar búsqueda (mantener lógica existente)
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`

      const baseSearchConditions = [
        { clave_acceso: ILike(searchTerm) },
        { code: ILike(searchTerm) },
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

    const [entities, totalCount, totalRecords] = await Promise.all([
      this.saleRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
        relations: {
          customer: true,
          user: true,
          items: {
            product: true,
          },
        },
      }),
      this.saleRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      this.saleRepository.count({ withDeleted: true }),
    ])

    return {
      data: entities.map(SaleMapper.toDomain),
      totalCount,
      totalRecords,
    }
  }

  async findById(id: Sale['id']): Promise<NullableType<Sale>> {
    const entity = await this.saleRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
      relations: {
        customer: true,
        items: {
          product: true,
        },
      },
    })
    return entity ? SaleMapper.toDomain(entity) : null
  }

  async findByIds(ids: Sale['id'][]): Promise<Sale[]> {
    const entities = await this.saleRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })
    return entities.map(SaleMapper.toDomain)
  }

  async findByField<K extends keyof Sale>(
    field: K,
    value: Sale[K] | string,
  ): Promise<NullableType<Sale>> {
    if (!value) return null

    const findOptions: {
      where: FindOptionsWhere<SaleEntity>
      relations?: string[]
    } = {
      where: {},
    }

    if (field === 'customer') {
      findOptions.where = { customer: { id: value as string } }
      findOptions.relations = [PATH_SOURCE.CUSTOMER]
    } else {
      findOptions.where = { [field]: value } as FindOptionsWhere<SaleEntity>
    }

    const entity = await this.saleRepository.findOne({
      ...findOptions,
      withDeleted: true,
    })

    return entity ? SaleMapper.toDomain(entity) : null
  }

  async update(
    id: Sale['id'],
    payload: Partial<Sale>,
    entityManager?: EntityManager, // ✅ Hacer opcional con fallback
  ): Promise<Sale> {
    // ✅ Usar EntityManager si se proporciona, sino usar el repository directo
    const repository = entityManager
      ? entityManager.getRepository(SaleEntity)
      : this.saleRepository

    // ✅ Buscar la entidad existente
    const existingEntity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!existingEntity) {
      console.log(`❌ [SaleRepository] Sale con ID ${id} no encontrado`)
      throw new Error(`Sale con ID ${id} no encontrado`)
    }

    // ✅ Crear objeto de actualización con solo los campos válidos
    const updateData: Partial<SaleEntity> = {}

    // Solo incluir campos que están en el payload y no son undefined
    if (payload.estado_sri !== undefined) {
      updateData.estado_sri = payload.estado_sri
    }

    if (payload.clave_acceso !== undefined) {
      updateData.clave_acceso = payload.clave_acceso
    }

    if (payload.comprobante_id !== undefined) {
      updateData.comprobante_id = payload.comprobante_id
    }

    if (Object.keys(updateData).length === 0) {
      console.log(`⚠️ [SaleRepository] No hay datos para actualizar`)
      return SaleMapper.toDomain(existingEntity)
    }

    // ✅ Realizar la actualización usando merge + save
    console.log(`🔄 [SaleRepository] Ejecutando actualización...`)
    const entityToUpdate = repository.merge(existingEntity, updateData)
    const updatedEntity = await repository.save(entityToUpdate)

    // ✅ Recargar con relaciones para devolver datos completos
    const reloadedEntity = await repository.findOne({
      where: { id: updatedEntity.id },
      relations: {
        customer: true,
        items: {
          product: true,
        },
      },
    })

    if (!reloadedEntity) throw new Error('Failed to reload sale after update')

    return SaleMapper.toDomain(reloadedEntity)
  }
}
