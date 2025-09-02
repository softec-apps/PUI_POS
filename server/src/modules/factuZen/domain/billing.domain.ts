import { BillingEntity } from '@/modules/factuZen/entities/billing.entity'

export class BillingDomain {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromEntity(entity: BillingEntity): BillingDomain {
    return new BillingDomain(
      entity.id,
      entity.email,
      entity.password,
      entity.createdAt,
      entity.updatedAt,
    )
  }

  toEntity(): BillingEntity {
    const entity = new BillingEntity()
    entity.id = this.id
    entity.email = this.email
    entity.password = this.password
    entity.createdAt = this.createdAt
    entity.updatedAt = this.updatedAt
    return entity
  }
}
