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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { RoleEnum } from '@/common/constants/roles-const'
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { SupplierService } from '@/modules/suppliers/supplier.service'
import { ParamSupplierDto } from '@/modules/suppliers/dto/param-supplier.dto'
import { QuerySupplierDto } from '@/modules/suppliers/dto/query-supplier.dto'
import { CreateSupplierDto } from '@/modules/suppliers/dto/create-supplier.dto'
import { UpdateSupplierDto } from '@/modules/suppliers/dto/update-supplier.dto'
import { SupplierApiDocs } from '@/modules/suppliers/docs/supplier-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.SUPPLIER)
@ApiBearerAuth()
@Roles(RoleEnum.Admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.SUPPLIER,
  version: '1',
})
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  /**
   * Create a new supplier.
   * @param createSupplierDto - Data transfer object for supplier creation.
   * @returns The API standard response
   */
  @Post()
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.CREATED)
  @SupplierApiDocs.create
  async create(
    @Body() createSupplierDto: CreateSupplierDto,
  ): Promise<ApiResponse<Supplier>> {
    return await this.supplierService.create(createSupplierDto)
  }

  /**
   * Get all suppliers with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.OK)
  @SupplierApiDocs.findAll
  async findAll(
    @Query() query: QuerySupplierDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Supplier>>> {
    return await this.supplierService.findManyWithPagination(query)
  }

  /**
   * Get all suppliers with pagination
   * @param param - Parameter containing the template ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @SupplierApiDocs.findOne
  async findOne(
    @Param() param: ParamSupplierDto,
  ): Promise<ApiResponse<Supplier>> {
    return await this.supplierService.findById(param.id)
  }

  /**
   * Update a supplier.
   * @param UpdateSupplierDto - Data transfer object for supplier update.
   * @returns The API standard responsea
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @SupplierApiDocs.update
  async update(
    @Param() param: ParamSupplierDto,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<ApiResponse<Supplier>> {
    return await this.supplierService.update(param.id, updateSupplierDto)
  }

  /**
   * Permanently delete a supplier (hard delete)
   * @param param - Parameter containing the supplier ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the supplier
   */
  @Delete(':id/hard-delete')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @SupplierApiDocs.hardDelete
  hardDelete(@Param() param: ParamSupplierDto): Promise<ApiResponse> {
    return this.supplierService.hardDelete(param.id)
  }
}
