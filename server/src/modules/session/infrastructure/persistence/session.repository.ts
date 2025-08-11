import { User } from '@/modules/users/domain/user'
import { NullableType } from '@/utils/types/nullable.type'
import { Session } from '../../domain/session'

export abstract class SessionRepository {
  abstract findById(id: Session['id']): Promise<NullableType<Session>>

  abstract create(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Session>

  abstract update(
    id: Session['id'],
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session | null>

  abstract findByField<K extends keyof Session>(
    field: K,
    value: Session[K],
    options?: { withDeleted?: boolean },
  ): Promise<NullableType<Session>>

  abstract findByUserId(
    userId: User['id'],
    options?: { withDeleted?: boolean },
  ): Promise<Session[]>

  abstract deleteById(id: Session['id']): Promise<void>

  abstract deleteByUserId(conditions: { userId: User['id'] }): Promise<void>

  abstract deleteByUserIdWithExclude(conditions: {
    userId: User['id']
    excludeSessionId: Session['id']
  }): Promise<void>
}
