import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  CustomerType,
  CustomerTypeLabels,
  IdentificationType,
} from '@/modules/customer/customer.enum'
import { CustomerEntity } from '@/modules/customer/infrastructure/persistence/relational/entities/customer.entity'

@Injectable()
export class CustomerSeedService {
  constructor(
    @InjectRepository(CustomerEntity)
    private repository: Repository<CustomerEntity>,
  ) {}

  async run() {
    const count = await this.repository.count()

    const [firstName, lastName] = CustomerTypeLabels[
      CustomerType.FINAL_CONSUMER
    ]
      .toUpperCase()
      .split(' ')

    const customer = {
      firstName,
      lastName,
    }

    if (!count) {
      await this.repository.save([
        this.repository.create({
          firstName: customer.firstName,
          lastName: customer.lastName,
          identificationNumber: '9999999999999',
          customerType: CustomerType.FINAL_CONSUMER,
          identificationType: IdentificationType.FINAL_CONSUMER,
        }),
      ])
    }
  }
}
