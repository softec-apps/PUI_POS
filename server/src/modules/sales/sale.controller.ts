import {
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  Controller,
  HttpStatus,
  SerializeOptions,
  UseGuards,
  Request,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '@/modules/roles/roles.decorator'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { RolesGuard } from '@/modules/roles/roles.guard'

import { Sale } from '@/modules/sales/domain/sale'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { QuerySaleDto } from '@/modules/sales/dto/query-sale.dto'
import { ParamSaleDto } from '@/modules/sales/dto/param-sale.dto'
import { SaleService } from '@/modules/sales/sale.service'
import { CreateSaleDto } from '@/modules/sales/dto/create-sale.dto'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'
import { SaleApiDocs } from '@/modules/sales/docs/sale-swagger.docs'

@ApiTags(PATH_SOURCE.SALE)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.SALE,
  version: '1',
})
export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  /**
   * Create a new sale
   */
  @Post('simple')
  @SaleApiDocs.create
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.CREATED)
  async createSimpleSale(
    @Body() createSaleDto: CreateSaleDto,
    @Request() req: any,
  ): Promise<ApiResponse<Sale>> {
    return await this.saleService.createSimpleSale(createSaleDto, req.user.id)
  }

  /**
   * Create a new sale - Facturación SRI
   */
  @Post('sri')
  @SaleApiDocs.create
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.CREATED)
  async createSaleSri(
    @Body() createSaleDto: CreateSaleDto,
    @Request() req: any,
  ): Promise<ApiResponse<Sale>> {
    return await this.saleService.createSaleSri(createSaleDto, req.user.id)
  }

  /**
   * Get all sales with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @SaleApiDocs.findAll
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QuerySaleDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Sale>>> {
    return await this.saleService.findManyWithPagination(query)
  }

  /**
   * Get a single sale by ID
   */
  @Get(':id')
  @SaleApiDocs.findOne
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param() param: ParamSaleDto): Promise<ApiResponse<Sale>> {
    return await this.saleService.findById(param.id)
  }
}
