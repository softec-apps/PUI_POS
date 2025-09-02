import {
  Put,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  UseGuards,
  HttpStatus,
  Controller,
  SerializeOptions,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '@/modules/roles/roles.decorator'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { Establishment } from '@/modules/establishment/domain/establishment'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { EstablishmentService } from '@/modules/establishment/establishment.service'
import { ParamEstablishmentDto } from '@/modules/establishment/dto/param-establishment.dto'
import { QueryEstablishmentDto } from '@/modules/establishment/dto/query-establishment.dto'
import { CreateEstablishmentDto } from '@/modules/establishment/dto/create-establishment.dto'
import { UpdateEstablishmentDto } from '@/modules/establishment/dto/update-establishment.dto'
import { EstablishmentApiDocs } from '@/modules/establishment/docs/establishment-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.ESTABLISHMENT)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.ESTABLISHMENT,
  version: '1',
})
export class EstablishmentController {
  constructor(private readonly establishmentService: EstablishmentService) {}

  /**
   * Create a new establishment.
   * @param createEstablishmentDto - Data transfer object for establishment creation.
   * @returns The API standard response
   */
  @Post()
  @EstablishmentApiDocs.create
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createEstablishmentDto: CreateEstablishmentDto,
  ): Promise<ApiResponse<Establishment>> {
    console.log(createEstablishmentDto)
    return await this.establishmentService.create(createEstablishmentDto)
  }

  /**
   * Get all establishments with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @EstablishmentApiDocs.findAll
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryEstablishmentDto,
  ): Promise<
    ApiResponse<EnhancedInfinityPaginationResponseDto<Establishment>>
  > {
    return await this.establishmentService.findManyWithPagination(query)
  }

  /**
   * Get all establishments with pagination
   * @param param - Parameter containing the template ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @EstablishmentApiDocs.findOne
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param() param: ParamEstablishmentDto,
  ): Promise<ApiResponse<Establishment>> {
    return await this.establishmentService.findById(param.id)
  }

  /**
   * Update a establishment.
   * @param UpdateEstablishmentDto - Data transfer object for establishment update.
   * @returns The API standard responsea
   */
  @Put(':id')
  @EstablishmentApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param() param: ParamEstablishmentDto,
    @Body() updateEstablishmentDto: UpdateEstablishmentDto,
  ): Promise<ApiResponse<Establishment>> {
    return await this.establishmentService.update(
      param.id,
      updateEstablishmentDto,
    )
  }
}
