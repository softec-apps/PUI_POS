import { EntityManager } from 'typeorm'
import { User } from '@/modules/users/domain/user'
import { NullableType } from '@/utils/types/nullable.type'
import { DeepPartial } from '@/utils/types/deep-partial.type'
import { IPaginationOptions } from '@/utils/types/pagination-options'
import { FilterUserDto, SortUserDto } from '@/modules/users/dto/query-user.dto'

export abstract class UserRepository {
  abstract create(
    data: Omit<User, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
    entityManager: EntityManager,
  ): Promise<User>

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterUserDto | null
    sortOptions?: SortUserDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: User[]; totalCount: number; totalRecords: number }>

  abstract findById(id: User['id']): Promise<NullableType<User>>

  abstract findByIds(ids: User['id'][]): Promise<User[]>

  abstract findByField<K extends keyof User>(
    field: K,
    value: User[K],
    options?: { withDeleted?: boolean },
  ): Promise<NullableType<User>>

  abstract findByEmail(email: User['email']): Promise<NullableType<User>>

  abstract findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId']
    provider: User['provider']
  }): Promise<NullableType<User>>

  abstract update(
    id: User['id'],
    payload: DeepPartial<User>,
    entityManager: EntityManager,
  ): Promise<User>

  abstract softDelete(
    id: User['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract restore(id: User['id'], entityManager: EntityManager): Promise<void>

  abstract hardDelete(
    id: User['id'],
    entityManager: EntityManager,
  ): Promise<void>
}
