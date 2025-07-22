import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/relational/entities/role.entity'

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  async run() {
    const roles = [
      {
        id: RoleEnum.Admin,
        name: ROLES.ADMIN,
      },
      {
        id: RoleEnum.Cashier,
        name: ROLES.CASHIER,
      },
      {
        id: RoleEnum.Manager,
        name: ROLES.MANAGER,
      },
      {
        id: RoleEnum.Inventory,
        name: ROLES.INVENTORY,
      },
      {
        id: RoleEnum.Customer,
        name: ROLES.CUSTOMER,
      },
    ]

    for (const role of roles) {
      const count = await this.repository.count({
        where: {
          id: role.id,
        },
      })

      if (!count) await this.repository.save(this.repository.create(role))
    }
  }
}
