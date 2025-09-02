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
import { Brand } from '@/modules/brand/domain/brand'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { BrandService } from '@/modules/brand/brand.service'
import { ParamBrandDto } from '@/modules/brand/dto/param-brand.dto'
import { QueryBrandDto } from '@/modules/brand/dto/query-brand.dto'
import { CreateBrandDto } from '@/modules/brand/dto/create-brand.dto'
import { UpdateBrandDto } from '@/modules/brand/dto/update-brand.dto'
import { BrandApiDocs } from '@/modules/brand/docs/brand-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.BRAND)
@ApiBearerAuth()
@Roles(RoleEnum.Admin, RoleEnum.Manager)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.BRAND,
  version: '1',
})
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  /**
   * Create a new brand.
   * @param createBrandDto - Data transfer object for brand creation.
   * @returns The API standard response
   */
  @Post()
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.CREATED)
  @BrandApiDocs.create
  async create(
    @Body() createBrandDto: CreateBrandDto,
  ): Promise<ApiResponse<Brand>> {
    return await this.brandService.create(createBrandDto)
  }

  /**
   * Get all brands with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.OK)
  @BrandApiDocs.findAll
  async findAll(
    @Query() query: QueryBrandDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Brand>>> {
    return await this.brandService.findManyWithPagination(query)
  }

  /**
   * Get all brands with pagination
   * @param param - Parameter containing the template ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @BrandApiDocs.findOne
  async findOne(@Param() param: ParamBrandDto): Promise<ApiResponse<Brand>> {
    return await this.brandService.findById(param.id)
  }

  /**
   * Update a brand.
   * @param UpdateBrandDto - Data transfer object for brand update.
   * @returns The API standard responsea
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @BrandApiDocs.update
  async update(
    @Param() param: ParamBrandDto,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<ApiResponse<Brand>> {
    return await this.brandService.update(param.id, updateBrandDto)
  }

  /**
   * Soft delete a brand (hard delete)
   * @param param - Parameter containing the brand ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will soft remove the brand
   */
  @Delete(':id')
  //@BrandApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param() param: ParamBrandDto): Promise<ApiResponse> {
    return await this.brandService.softDelete(param.id)
  }

  /**
   * Restore a brand.
   * @param RestoreBrandDto - Data transfer object for brand restore.
   * @returns The API standard responsea
   */
  @Patch(':id/restore')
  //@BrandApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async restore(@Param() param: ParamBrandDto): Promise<ApiResponse<Brand>> {
    return await this.brandService.restore(param.id)
  }

  /**
   * Permanently delete a brand (hard delete)
   * @param param - Parameter containing the brand ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the brand
   */
  @Delete(':id/hard-delete')
  @BrandApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  hardDelete(@Param() param: ParamBrandDto): Promise<ApiResponse> {
    return this.brandService.hardDelete(param.id)
  }
}
