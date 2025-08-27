import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import bcrypt from 'bcryptjs'
import { Status } from '@/statuses/domain/status'
import { User } from '@/modules/users/domain/user'
import { Role } from '@/modules/roles/domain/role'
import { StatusEnum } from '@/statuses/statuses.enum'
import { FileType } from '@/modules/files/domain/file'
import { RoleEnum } from '@/common/constants/roles-const'
import { NullableType } from '@/utils/types/nullable.type'
import { FilesService } from '@/modules/files/files.service'
import { CreateUserDto } from '@/modules/users/dto/create-user.dto'
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto'
import { AuthProvidersEnum } from '@/modules/auth/auth-providers.enum'
import { UserRepository } from '@/modules/users/infrastructure/persistence/user.repository'
import { DataSource } from 'typeorm'
import { ApiResponse } from '@/utils/types/request-response.type'
import {
  createdResponse,
  deletedResponse,
  listResponse,
  readResponse,
  updatedResponse,
} from '@/common/helpers/responseSuccess.helper'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { MESSAGE_RESPONSE } from '@/modules/users/messages/responseOperation.message'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'
import { QueryUserDto } from '@/modules/users/dto/query-user.dto'
import { SessionService } from '../session/session.service'

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
    private readonly sessionService: SessionService,
    private readonly usersRepository: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    return this.dataSource.transaction(async (entityManager) => {
      let password: string | undefined = undefined
      if (createUserDto.password) {
        const salt = await bcrypt.genSalt()
        password = await bcrypt.hash(createUserDto.password, salt)
      }

      let email: string | null = null
      if (createUserDto.email) {
        const userObject = await this.usersRepository.findByEmail(
          createUserDto.email,
        )
        if (userObject) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE.CONFLIC.EMAIL,
          })
        }
        email = createUserDto.email
      }

      let dni: string | null = null
      if (createUserDto.dni) {
        const userObject = await this.usersRepository.findByField(
          'dni',
          createUserDto.dni,
        )
        if (userObject) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE.CONFLIC.DNI,
          })
        }
        dni = createUserDto.dni
      }

      let photo: FileType | null | undefined = undefined

      if (createUserDto.photo?.id) {
        const fileObject = await this.filesService.findById(
          createUserDto.photo.id,
        )
        if (!fileObject) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE.NOT_FOUND.IMAGE,
          })
        }
        photo = fileObject
      } else if (createUserDto.photo === null) {
        photo = null
      }

      let role: Role | undefined = undefined
      if (createUserDto.role?.id) {
        const roleObject = Object.values(RoleEnum)
          .map(String)
          .includes(String(createUserDto.role.id))
        if (!roleObject) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE.NOT_FOUND.ROL,
          })
        }
        role = {
          id: createUserDto.role.id,
        }
      }

      let status: Status | undefined = undefined
      const statusId = createUserDto.status?.id ?? 1 // Asignar 1 si es null o undefine, 1 == active
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(statusId))
      if (!statusObject) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.STATUS,
        })
      }
      status = {
        id: statusId,
      }

      await this.usersRepository.create(
        {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: email,
          dni: dni,
          password: password,
          photo: photo,
          role: role,
          status: status,
          provider: createUserDto.provider ?? AuthProvidersEnum.email,
          socialId: createUserDto.socialId,
        },
        entityManager,
      )

      return createdResponse({
        resource: PATH_SOURCE.USER,
        message: MESSAGE_RESPONSE.CREATED,
      })
    })
  }

  async findManyWithPagination(
    query: QueryUserDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<User>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10

    // Si el límite es 9999, marcar para obtener todos los registros
    const isGetAll = limit === 9999

    if (!isGetAll && limit > 50) limit = 50

    // Si es obtener todos, usar un límite muy alto para la consulta inicial
    const queryLimit = isGetAll ? Number.MAX_SAFE_INTEGER : limit

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.usersRepository.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page: isGetAll ? 1 : page,
          limit: queryLimit,
        },
        searchOptions: query?.search,
      })

    // Para el caso de obtener todos, ajustar los parámetros de paginación
    const finalPage = isGetAll ? 1 : page
    const finalLimit = isGetAll ? totalCount : limit

    // Formatear respuesta paginada con la utilidad
    const paginatedData = infinityPaginationWithMetadata(
      data,
      {
        page: finalPage,
        limit: finalLimit,
      },
      totalCount,
      totalRecords,
    )

    return listResponse({
      data: paginatedData,
      resource: PATH_SOURCE.USER,
      message: MESSAGE_RESPONSE.LISTED,
    })
  }

  async findById(id: User['id']): Promise<ApiResponse<User>> {
    const result = await this.usersRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE.NOT_FOUND.ID,
      })
    }

    return readResponse({
      data: result,
      resource: PATH_SOURCE.USER,
      message: MESSAGE_RESPONSE.READED,
    })
  }

  async findByIds(ids: User['id'][]): Promise<User[]> {
    return await this.usersRepository.findByIds(ids)
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    return await this.usersRepository.findByEmail(email)
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId']
    provider: User['provider']
  }): Promise<NullableType<User>> {
    return await this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    })
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    return await this.dataSource.transaction(async (entityManager) => {
      let password: string | undefined = undefined
      if (updateUserDto.password) {
        const userObject = await this.usersRepository.findById(id)
        if (userObject && userObject?.password !== updateUserDto.password) {
          const salt = await bcrypt.genSalt()
          password = await bcrypt.hash(updateUserDto.password, salt)
        }
      }

      let email: string | null | undefined = undefined
      if (updateUserDto.email) {
        const userObject = await this.usersRepository.findByEmail(
          updateUserDto.email,
        )
        if (userObject && userObject.id !== id) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE.NOT_FOUND.EMAIL,
          })
        }
        email = updateUserDto.email
      } else if (updateUserDto.email === null) {
        email = null
      }

      let dni: string | null | undefined = undefined
      if (updateUserDto.dni) {
        const userObject = await this.usersRepository.findByField(
          'dni',
          updateUserDto.dni,
        )
        if (userObject && userObject.id !== id) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE.NOT_FOUND.DNI,
          })
        }
        dni = updateUserDto.dni
      } else if (updateUserDto.dni === null) {
        dni = null
      }

      let photo: FileType | null | undefined = undefined

      if (
        updateUserDto.photo &&
        typeof updateUserDto.photo === 'object' &&
        'id' in updateUserDto.photo
      ) {
        const fileObject = await this.filesService.findById(
          updateUserDto.photo.id,
        )
        if (!fileObject) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE.NOT_FOUND.IMAGE,
          })
        }
        photo = fileObject
      } else if (updateUserDto.photo === null || updateUserDto.photo === '') {
        photo = null
      }

      let role: Role | undefined = undefined
      if (updateUserDto.role?.id) {
        const roleObject = Object.values(RoleEnum)
          .map(String)
          .includes(String(updateUserDto.role.id))
        if (!roleObject) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE.NOT_FOUND.ROL,
          })
        }
        role = {
          id: updateUserDto.role.id,
        }
      }

      let status: Status | undefined = undefined
      if (updateUserDto.status?.id) {
        const statusObject = Object.values(StatusEnum)
          .map(String)
          .includes(String(updateUserDto.status.id))
        if (!statusObject) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE.NOT_FOUND.STATUS,
          })
        }
        status = {
          id: updateUserDto.status.id,
        }
      }

      await this.usersRepository.update(
        id,
        {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          email,
          dni: updateUserDto.dni,
          password,
          photo,
          role,
          status,
          provider: updateUserDto.provider,
          socialId: updateUserDto.socialId,
        },
        entityManager,
      )

      return updatedResponse({
        resource: PATH_SOURCE.USER,
        message: MESSAGE_RESPONSE.UPDATED,
      })
    })
  }

  async softDelete(
    id: User['id'],
    userId?: string,
  ): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const user = await this.usersRepository.findById(id)

      if (!user) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      if (user?.id === userId) {
        throw new BadRequestException({
          message: MESSAGE_RESPONSE.CONFLIC.SOFT_DELETE,
        })
      }

      const isValidStatus = Object.values(StatusEnum)
        .map((value) => String(value))
        .includes('2')

      if (!isValidStatus) {
        throw new BadRequestException({
          message: 'El status con ID 2 no es válido',
        })
      }

      await this.usersRepository.update(
        id,
        {
          status: {
            id: 2,
          },
        },
        entityManager,
      )

      // ✅ Luego realizar el soft delete
      await this.usersRepository.softDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.USER,
        message: MESSAGE_RESPONSE.DELETED.SOFT,
      })
    })
  }

  async restore(id: User['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const user = await this.usersRepository.findById(id)

      if (!user) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.usersRepository.update(
        id,
        {
          status: {
            id: 1,
          },
        },
        entityManager,
      )

      await this.usersRepository.restore(id, entityManager)

      return updatedResponse({
        resource: PATH_SOURCE.USER,
        message: MESSAGE_RESPONSE.RESTORED,
      })
    })
  }

  async hardDelete(
    id: User['id'],
    userId?: string,
  ): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const user = await this.usersRepository.findById(id)

      if (!user)
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })

      if (user?.id === userId)
        throw new BadRequestException({
          message: MESSAGE_RESPONSE.CONFLIC.HARD_DELETE,
        })

      await this.usersRepository.hardDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.USER,
        message: MESSAGE_RESPONSE.DELETED.HARD,
      })
    })
  }
}
