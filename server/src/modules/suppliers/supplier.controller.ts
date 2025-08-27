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
  Patch,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '@/modules/roles/roles.decorator'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
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
import { ParamUserDto } from '../users/dto/param-user.dto'

@ApiTags(PATH_SOURCE.SUPPLIER)
@ApiBearerAuth()
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
  @SupplierApiDocs.create
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.CREATED)
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
  @SupplierApiDocs.findAll
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
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
  @SupplierApiDocs.findOne
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
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
  @SupplierApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param() param: ParamSupplierDto,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<ApiResponse<Supplier>> {
    return await this.supplierService.update(param.id, updateSupplierDto)
  }

  /**
   * Soft delete a supplier (hard delete)
   * @param param - Parameter containing the supplier ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will soft remove the supplier
   */
  @Delete(':id')
  //@SupplierApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param() param: ParamSupplierDto): Promise<ApiResponse> {
    return await this.supplierService.softDelete(param.id)
  }

  /**
   * Restore a supplier.
   * @param RestoreSupplierDto - Data transfer object for supplier restore.
   * @returns The API standard responsea
   */
  @Patch(':id/restore')
  @SupplierApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async restore(@Param() param: ParamUserDto): Promise<ApiResponse<Supplier>> {
    return await this.supplierService.restore(param.id)
  }

  /**
   * Permanently delete a supplier (hard delete)
   * @param param - Parameter containing the supplier ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the supplier
   */
  @Delete(':id/hard-delete')
  @SupplierApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  hardDelete(@Param() param: ParamSupplierDto): Promise<ApiResponse> {
    return this.supplierService.hardDelete(param.id)
  }
}
