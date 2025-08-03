import {
  Put,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  HttpCode,
  UseGuards,
  HttpStatus,
  Controller,
  SerializeOptions,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '@/modules/roles/roles.decorator'
import { Kardex } from '@/modules/kardex/domain/kardex'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { KardexService } from '@/modules/kardex/kardex.service'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { ParamKardexDto } from '@/modules/kardex/dto/param-kardex.dto'
import { QueryKardexDto } from '@/modules/kardex/dto/query-kardex.dto'
import { KardexApiDocs } from '@/modules/kardex/docs/kardex-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.KARDEX)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.KARDEX,
  version: '1',
})
export class KardexController {
  constructor(private readonly kardexService: KardexService) {}

  /**
   * Get all kardex with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @KardexApiDocs.findAll
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryKardexDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Kardex>>> {
    return await this.kardexService.findManyWithPagination(query)
  }

  /**
   * GetAll lasted record by product kardex with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get('/lasted')
  @KardexApiDocs.findAllLasted
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async findAllLatestByProduct(
    @Query() query: QueryKardexDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Kardex>>> {
    return await this.kardexService.findLatestByProductWithPagination(query)
  }

  /**
   * Get all kardex with pagination
   * @param param - Parameter containing the kardex ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @KardexApiDocs.findOne
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param() param: ParamKardexDto): Promise<ApiResponse<Kardex>> {
    return await this.kardexService.findById(param.id)
  }
}
