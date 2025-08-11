import { Injectable } from '@nestjs/common'

import { SessionRepository } from './infrastructure/persistence/session.repository'
import { Session } from './domain/session'
import { User } from '@/modules/users/domain/user'
import { NullableType } from '@/utils/types/nullable.type'

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  findById(id: Session['id']): Promise<NullableType<Session>> {
    return this.sessionRepository.findById(id)
  }

  findByField<K extends keyof Session>(
    field: K,
    value: Session[K],
  ): Promise<NullableType<Session>> {
    return this.sessionRepository.findByField(field, value)
  }

  findByUserId(
    userId: User['id'],
    options?: { withDeleted?: boolean },
  ): Promise<Session[]> {
    return this.sessionRepository.findByUserId(userId, options)
  }

  create(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Session> {
    return this.sessionRepository.create(data)
  }

  update(
    id: Session['id'],
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session | null> {
    return this.sessionRepository.update(id, payload)
  }

  deleteById(id: Session['id']): Promise<void> {
    return this.sessionRepository.deleteById(id)
  }

  deleteByUserId(conditions: { userId: User['id'] }): Promise<void> {
    return this.sessionRepository.deleteByUserId(conditions)
  }

  deleteByUserIdWithExclude(conditions: {
    userId: User['id']
    excludeSessionId: Session['id']
  }): Promise<void> {
    return this.sessionRepository.deleteByUserIdWithExclude(conditions)
  }
}
