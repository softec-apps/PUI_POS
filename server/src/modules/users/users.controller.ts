import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  SerializeOptions,
  Put,
  Patch,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@/modules/users/domain/user'
import { Roles } from '@/modules/roles/roles.decorator'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UsersService } from '@/modules/users/users.service'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { QueryUserDto } from '@/modules/users/dto/query-user.dto'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { ApiResponse } from '@/utils/types/request-response.type'
import { ParamUserDto } from '@/modules/users/dto/param-user.dto'
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto'
import { CreateUserDto } from '@/modules/users/dto/create-user.dto'
import { UserApiDocs } from '@/modules/users/docs/user-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.USER)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.USER,
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user.
   * @param createUserDto - Data transfer object for user creation.
   * @returns The API standard response
   */
  @Post()
  @UserApiDocs.create
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProfileDto: CreateUserDto,
  ): Promise<ApiResponse<User>> {
    return await this.usersService.create(createProfileDto)
  }

  /**
   * Get all users with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @UserApiDocs.findAll
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryUserDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<User>>> {
    return await this.usersService.findManyWithPagination(query)
  }

  /**
   * Get all user
   * @param param - Parameter containing the template ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @UserApiDocs.findOne
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: User['id']): Promise<ApiResponse<User>> {
    return await this.usersService.findById(id)
  }

  /**
   * Update a user.
   * @param UpdateUserDto - Data transfer object for user update.
   * @returns The API standard responsea
   */
  @Patch(':id')
  @UserApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param() param: ParamUserDto,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    return await this.usersService.update(param.id, updateProfileDto)
  }

  /**
   * Permanently delete a user (hard delete)
   * @param param - Parameter containing the user ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the user
   */
  @Delete(':id/hard-delete')
  @UserApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param() param: ParamUserDto): Promise<ApiResponse> {
    return await this.usersService.hardDelete(param.id)
  }
}
