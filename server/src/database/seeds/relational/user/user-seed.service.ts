import bcrypt from 'bcryptjs'
import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { StatusEnum } from '@/statuses/statuses.enum'
import { RoleEnum } from '@/common/constants/roles-const'
import { UserEntity } from '@/modules/users/infrastructure/persistence/relational/entities/user.entity'

type SeedUser = {
  firstName: string
  lastName: string
  email: string
  role: {
    id: RoleEnum
    name: string
  }
}

@Injectable()
export class UserSeedService {
  private readonly defaultPassword = 'secret'

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async run(): Promise<void> {
    await this.seedAdminUser()
    await this.seedRegularUsers()
  }

  private async seedAdminUser(): Promise<void> {
    const adminExists = await this.userRepository.exists({
      where: { role: { id: RoleEnum.Admin } },
    })

    if (!adminExists) {
      await this.createUser({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@gmail.com',
        role: {
          id: RoleEnum.Admin,
          name: 'Admin',
        },
      })
    }
  }

  private async seedRegularUsers(): Promise<void> {
    const usersToSeed: SeedUser[] = [
      {
        firstName: 'John',
        lastName: 'Cashier',
        email: 'cashier@gmail.com',
        role: {
          id: RoleEnum.Cashier,
          name: 'Cashier',
        },
      },
      {
        firstName: 'Sarah',
        lastName: 'Manager',
        email: 'manager@gmail.com',
        role: {
          id: RoleEnum.Manager,
          name: 'Manager',
        },
      },
    ]

    for (const user of usersToSeed) {
      const userExists = await this.userRepository.exists({
        where: { role: { id: user.role.id } },
      })

      if (!userExists) {
        await this.createUser(user)
      }
    }
  }

  private async createUser(userData: SeedUser): Promise<UserEntity> {
    const salt = await bcrypt.genSalt()
    const password = await bcrypt.hash(this.defaultPassword, salt)

    return this.userRepository.save(
      this.userRepository.create({
        ...userData,
        password,
        status: {
          id: StatusEnum.active,
          name: 'Active',
        },
      }),
    )
  }
}
