import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { BillingDomain } from '@/modules/factuZen/domain/billing.domain'
import { BillingEntity } from '@/modules/factuZen/entities/billing.entity'

@Injectable()
export class BillingRepository {
  constructor(
    @InjectRepository(BillingEntity)
    private readonly billingEntityRepository: Repository<BillingEntity>,
  ) {}

  async findByEmail(email: string): Promise<BillingDomain | null> {
    const entity = await this.billingEntityRepository.findOne({
      where: { email },
    })
    return entity ? BillingDomain.fromEntity(entity) : null
  }

  // Método corregido - usar find() con take en lugar de findOne() sin where
  async findFirst(): Promise<BillingDomain | null> {
    try {
      const entities = await this.billingEntityRepository.find({
        order: { createdAt: 'ASC' },
        take: 1, // Obtener solo el primer registro
      })

      if (entities && entities.length > 0) {
        return BillingDomain.fromEntity(entities[0])
      }

      return null
    } catch (error) {
      console.error('Error en findFirst:', error)
      return null
    }
  }

  async create(email: string, password: string): Promise<BillingDomain> {
    const entity = this.billingEntityRepository.create({
      email,
      password,
    })
    const savedEntity = await this.billingEntityRepository.save(entity)
    return BillingDomain.fromEntity(savedEntity)
  }

  async update(
    id: string,
    email?: string,
    password?: string,
  ): Promise<BillingDomain | null> {
    const updateData: any = {}
    if (email) updateData.email = email
    if (password) updateData.password = password

    await this.billingEntityRepository.update(id, updateData)

    const updatedEntity = await this.billingEntityRepository.findOne({
      where: { id },
    })

    return updatedEntity ? BillingDomain.fromEntity(updatedEntity) : null
  }

  async findAll(): Promise<BillingDomain[]> {
    const entities = await this.billingEntityRepository.find({
      order: { createdAt: 'ASC' },
    })
    return entities.map((entity) => BillingDomain.fromEntity(entity))
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.billingEntityRepository.delete(id)
    return (result.affected ?? 0) > 0
  }

  // Método adicional para contar registros
  async count(): Promise<number> {
    return this.billingEntityRepository.count()
  }

  // Método para verificar si existe algún registro
  async hasAny(): Promise<boolean> {
    const count = await this.count()
    return count > 0
  }
}
