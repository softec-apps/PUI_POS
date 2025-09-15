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
  Request,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from '@/modules/roles/roles.decorator'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { ParamCategoryDto } from './dto/param-category.dto'
import { Category } from '@/modules/categories/domain/category'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { CategoriesService } from '@/modules/categories/categories.service'
import { QueryCategoryDto } from '@/modules/categories/dto/query-category.dto'
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/categories/dto/update-category.dto'
import { CategoryApiDocs } from '@/modules/categories/docs/category-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.CATEGORY)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.CATEGORY,
  version: '1',
})
export class CategoryController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Create a new category.
   * @param createCategoryDto - Data transfer object for category creation.
   * @returns The API standard response
   */
  @Post()
  @CategoryApiDocs.create
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    return await this.categoriesService.create(createCategoryDto)
  }

  /**
   * Get all categories with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @CategoryApiDocs.findAll
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryCategoryDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Category>>> {
    return await this.categoriesService.findManyWithPagination(query)
  }

  /**
   * Get all categories with pagination
   * @param param - Parameter containing the template ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @CategoryApiDocs.findOne
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param() param: ParamCategoryDto,
  ): Promise<ApiResponse<Category>> {
    return await this.categoriesService.findById(param.id)
  }

  /**
   * Update a category.
   * @param UpdateCategoryDto - Data transfer object for category update.
   * @returns The API standard responsea
   */
  @Put(':id')
  @CategoryApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param() param: ParamCategoryDto,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ApiResponse<Category>> {
    return await this.categoriesService.update(param.id, updateCategoryDto)
  }

  /**
   * Soft delete a category (hard delete)
   * @param param - Parameter containing the category ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will soft remove the category
   */
  @Delete(':id')
  //@CategoryApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param() param: ParamCategoryDto): Promise<ApiResponse> {
    return await this.categoriesService.softDelete(param.id)
  }

  /**
   * Permanently delete a category (hard delete)
   * @param param - Parameter containing the category ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the category
   */
  @Delete(':id/hard-delete')
  @CategoryApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  hardDelete(@Param() param: ParamCategoryDto): Promise<ApiResponse> {
    return this.categoriesService.hardDelete(param.id)
  }

  /**
   * Restore a category.
   * @param RestoreCategoryDto - Data transfer object for category restore.
   * @returns The API standard responsea
   */
  @Patch(':id/restore')
  @CategoryApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async restore(
    @Param() param: ParamCategoryDto,
  ): Promise<ApiResponse<Category>> {
    return await this.categoriesService.restore(param.id)
  }
}
