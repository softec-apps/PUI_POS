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
import { Product } from '@/modules/product/domain/product'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { ProductService } from '@/modules/product/product.service'
import { ParamProductDto } from '@/modules/product/dto/param-product.dto'
import { QueryProductDto } from '@/modules/product/dto/query-product.dto'
import { CreateProductDto } from '@/modules/product/dto/create-product.dto'
import { UpdateProductDto } from '@/modules/product/dto/update-product.dto'
import { ProductApiDocs } from '@/modules/product/docs/product-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.PRODUCT)
@ApiBearerAuth()
@Roles(RoleEnum.Admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.PRODUCT,
  version: '1',
})
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Create a new product.
   * @param createProductDto - Data transfer object for product creation.
   * @returns The API standard response
   */
  @Post()
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.CREATED)
  @ProductApiDocs.create
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ApiResponse<Product>> {
    return await this.productService.create(createProductDto)
  }

  /**
   * Get all products with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.OK)
  @ProductApiDocs.findAll
  async findAll(
    @Query() query: QueryProductDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Product>>> {
    return await this.productService.findManyWithPagination(query)
  }

  /**
   * Get all products with pagination
   * @param param - Parameter containing the template ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @ProductApiDocs.findOne
  async findOne(
    @Param() param: ParamProductDto,
  ): Promise<ApiResponse<Product>> {
    return await this.productService.findById(param.id)
  }

  /**
   * Update a product.
   * @param UpdateProductDto - Data transfer object for product update.
   * @returns The API standard responsea
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @ProductApiDocs.update
  async update(
    @Param() param: ParamProductDto,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    return await this.productService.update(param.id, updateProductDto)
  }

  /**
   * Permanently delete a product (hard delete)
   * @param param - Parameter containing the product ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the product
   */
  @Delete(':id/hard-delete')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @ProductApiDocs.hardDelete
  hardDelete(@Param() param: ParamProductDto): Promise<ApiResponse> {
    return this.productService.hardDelete(param.id)
  }
}
