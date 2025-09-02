import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { User } from '@/modules/users/domain/user'
import {
  FindOptionsWhere,
  Repository,
  In,
  EntityManager,
  ILike,
  Not,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm'
import { NullableType } from '@/utils/types/nullable.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { FilterUserDto, SortUserDto } from '@/modules/users/dto/query-user.dto'
import { UserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import { UserEntity } from '@/modules/users/infrastructure/persistence/relational/entities/user.entity'
import { UserMapper } from '@/modules/users/infrastructure/persistence/relational/mappers/user.mapper'
import { StatusEntity } from '@/statuses/infrastructure/persistence/relational/entities/status.entity'
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/relational/entities/role.entity'
import { FileEntity } from '@/modules/files/infrastructure/persistence/relational/entities/file.entity'
import { DateRangeDto } from '@/utils/dto/DateRangeDto'

@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(data: User, entityManager: EntityManager): Promise<User> {
    const repository = entityManager.getRepository(UserEntity)
    const persistenceModel = UserMapper.toPersistence(data)
    const newEntity = await repository.save(repository.create(persistenceModel))
    return UserMapper.toDomain(newEntity)
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterUserDto | null
    sortOptions?: SortUserDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{
    data: User[]
    totalCount: number // Total con filtros (para paginación)
    totalRecords: number // Total sin filtros (estadísticas generales)
  }> {
    let whereClause:
      | FindOptionsWhere<UserEntity>
      | FindOptionsWhere<UserEntity>[] = {}

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
            if (dateFilter) acc[key as keyof UserEntity] = dateFilter as any
          } else {
            // Filtros normales (roleId, statusId, etc.)
            acc[key as keyof UserEntity] = value as any
          }
          return acc
        }, {} as FindOptionsWhere<UserEntity>)
      }
    }

    // Aplicar búsqueda (mantener lógica existente)
    if (searchOptions?.trim()) {
      const searchTerm = `%${searchOptions.trim().toLowerCase()}%`

      const baseSearchConditions = [
        { email: ILike(searchTerm) },
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
          role: { id: Not(1) }, // Excluir roleId = 1
        }))
      } else {
        whereClause = baseSearchConditions.map((condition) => ({
          ...condition,
          role: { id: Not(1) },
        }))
      }
    } else {
      // Si no hay búsqueda, agregar la condición de exclusión del roleId = 1
      if (Array.isArray(whereClause)) {
        whereClause = whereClause.map((clause) => ({
          ...clause,
          role: { id: Not(1) },
        }))
      } else if (Object.keys(whereClause).length > 0) {
        whereClause = {
          ...whereClause,
          role: { id: Not(1) },
        }
      } else {
        whereClause = {
          role: { id: Not(1) },
        }
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
      this.usersRepository.find({
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        where: whereClause,
        order: orderClause,
        withDeleted: true,
      }),
      // 2. Total CON filtros (para paginación, excluir roleId = 1)
      this.usersRepository.count({
        where: whereClause,
        withDeleted: true,
      }),
      // 3. Total SIN filtros (estadísticas brutas, excluir roleId = 1)
      this.usersRepository.count({
        where: { role: { id: Not(1) } },
        withDeleted: true,
      }),
    ])

    return {
      data: entities.map(UserMapper.toDomain),
      totalCount, // Total filtrado
      totalRecords, // Total absoluto (sin roleId = 1)
    }
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    const entity = await this.usersRepository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })
    return entity ? UserMapper.toDomain(entity) : null
  }

  async findByIds(ids: User['id'][]): Promise<User[]> {
    const entities = await this.usersRepository.find({
      where: { id: In(ids) },
      withDeleted: true,
    })
    return entities.map((user) => UserMapper.toDomain(user))
  }

  async findByField<K extends keyof User>(
    field: K,
    value: User[K],
    options: { withDeleted?: boolean } = { withDeleted: false },
  ): Promise<NullableType<User>> {
    if (!value) return null
    const entity = await this.usersRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: options.withDeleted,
    })
    return entity ? UserMapper.toDomain(entity) : null
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null

    const entity = await this.usersRepository.findOne({
      where: { email },
    })

    return entity ? UserMapper.toDomain(entity) : null
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId']
    provider: User['provider']
  }): Promise<NullableType<User>> {
    if (!socialId || !provider) return null

    const entity = await this.usersRepository.findOne({
      where: { socialId, provider },
    })

    return entity ? UserMapper.toDomain(entity) : null
  }

  async update(
    id: User['id'],
    payload: Partial<User>,
    entityManager: EntityManager,
  ): Promise<User> {
    const repository = entityManager.getRepository(UserEntity)

    const existingEntity = await repository.findOne({
      where: { id: String(id) },
      withDeleted: true,
    })

    if (!existingEntity) throw new Error('User not found')

    // Preparar el payload para que sea compatible con UserEntity
    const entityPayload: Partial<UserEntity> = {}

    // Copiar propiedades simples
    if (payload.email !== undefined) entityPayload.email = payload.email
    if (payload.dni !== undefined) entityPayload.dni = payload.dni
    if (payload.password !== undefined)
      entityPayload.password = payload.password
    if (payload.provider !== undefined)
      entityPayload.provider = payload.provider
    if (payload.socialId !== undefined)
      entityPayload.socialId = payload.socialId
    if (payload.firstName !== undefined)
      entityPayload.firstName = payload.firstName
    if (payload.lastName !== undefined)
      entityPayload.lastName = payload.lastName

    // Manejar relaciones complejas
    if (payload.photo !== undefined) {
      if (payload.photo === null) {
        entityPayload.photo = null
      } else if (payload.photo) {
        const photoEntity = new FileEntity()
        photoEntity.id = payload.photo.id
        photoEntity.path = payload.photo.path
        entityPayload.photo = photoEntity
      }
    }

    if (payload.role !== undefined) {
      if (payload.role === null || payload.role === undefined) {
        entityPayload.role = undefined
      } else {
        const roleEntity = new RoleEntity()
        roleEntity.id = Number(payload.role.id)
        entityPayload.role = roleEntity
      }
    }

    if (payload.status !== undefined) {
      if (payload.status === null || payload.status === undefined) {
        entityPayload.status = undefined
      } else {
        const statusEntity = new StatusEntity()
        statusEntity.id = Number(payload.status.id)
        entityPayload.status = statusEntity
      }
    }

    const updatedEntity = await repository.save(
      repository.create({
        ...existingEntity,
        ...entityPayload,
      }),
    )

    return UserMapper.toDomain(updatedEntity)
  }

  async softDelete(
    id: User['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(UserEntity)
    await repository.softDelete(id)
  }

  async restore(id: User['id'], entityManager: EntityManager): Promise<void> {
    const repository = entityManager.getRepository(UserEntity)
    await repository.restore(id)
  }

  async hardDelete(
    id: User['id'],
    entityManager: EntityManager,
  ): Promise<void> {
    const repository = entityManager.getRepository(UserEntity)
    await repository.delete(id)
  }
}
