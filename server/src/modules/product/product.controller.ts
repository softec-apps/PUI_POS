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
  Request,
  Patch,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '@/modules/roles/roles.decorator'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { Product } from '@/modules/product/domain/product'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { ProductService } from '@/modules/product/product.service'
import { StockDiscountService } from '@/modules/product/managerStock.service'
import { ParamProductDto } from '@/modules/product/dto/param-product.dto'
import { QueryProductDto } from '@/modules/product/dto/query-product.dto'
import { CreateProductDto } from '@/modules/product/dto/create-product.dto'
import { UpdateProductDto } from '@/modules/product/dto/update-product.dto'
import { ProductApiDocs } from '@/modules/product/docs/product-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'
import {
  BulkStockDiscountResponseDto,
  CheckMultipleStockDto,
  CurrentStockResponseDto,
  GetCurrentStockDto,
  MultipleProductStockDiscountDto,
  SingleProductStockDiscountDto,
  StockCheckResponseDto,
  StockDiscountResponseDto,
} from './dto/stock-manager.dto'

@ApiTags(PATH_SOURCE.PRODUCT)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.PRODUCT,
  version: '1',
})
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly stockDiscountService: StockDiscountService,
  ) {}

  /**
   * Create a new product.
   * @param createProductDto - Data transfer object for product creation.
   * @returns The API standard response
   */
  @Post()
  @ProductApiDocs.create
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: any,
  ): Promise<ApiResponse<Product>> {
    return await this.productService.create(createProductDto, req.user.id)
  }

  /**
   * Get all products with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @ProductApiDocs.findAll
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryProductDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Product>>> {
    return await this.productService.findManyWithPagination(query)
  }

  /**
   * Get all product
   * @param param - Parameter containing the template ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @ProductApiDocs.findOne
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
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
  @ProductApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param() param: ParamProductDto,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ): Promise<ApiResponse<Product>> {
    return await this.productService.update(
      param.id,
      updateProductDto,
      req.user.id,
    )
  }

  /**
   * Soft delete a product (hard delete)
   * @param param - Parameter containing the product ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will soft remove the product
   */
  @Delete(':id')
  //@ProductApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async softDelete(@Param() param: ParamProductDto): Promise<ApiResponse> {
    return await this.productService.softDelete(param.id)
  }

  /**
   * Restore a product.
   * @param RestoreProductDto - Data transfer object for product restore.
   * @returns The API standard responsea
   */
  @Patch(':id/restore')
  @ProductApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async restore(
    @Param() param: ParamProductDto,
  ): Promise<ApiResponse<Product>> {
    return await this.productService.restore(param.id)
  }

  /**
   * Permanently delete a product (hard delete)
   * @param param - Parameter containing the product ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the product
   */
  @Delete(':id/hard-delete')
  @ProductApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @HttpCode(HttpStatus.OK)
  async hardDelete(@Param() param: ParamProductDto): Promise<ApiResponse> {
    return await this.productService.hardDelete(param.id)
  }

  @Post('single')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  async discountSingleProduct(
    @Body() discountDto: SingleProductStockDiscountDto,
    @Request() req: any,
  ): Promise<StockDiscountResponseDto> {
    const userId = req.user.id

    return this.stockDiscountService.discountSingleProduct(
      discountDto.productId,
      discountDto.quantity,
      userId,
      discountDto.reason,
      discountDto.unitCost,
    )
  }

  @Post('multiple')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  async discountMultipleProducts(
    @Body() discountDto: MultipleProductStockDiscountDto,
    @Request() req: any,
  ): Promise<BulkStockDiscountResponseDto> {
    const userId = req.user.id

    const discounts = discountDto.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
      reason: product.reason,
      unitCost: product.unitCost,
    }))

    return this.stockDiscountService.discountMultipleProducts(discounts, userId)
  }

  @Get('check/:productId')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  async checkSingleProductStock(
    @Param('productId') productId: string,
    @Query('quantity') quantity: number,
  ): Promise<{
    hasEnoughStock: boolean
    currentStock: number | null
    requiredQuantity: number
  }> {
    const hasStock = await this.stockDiscountService.hasEnoughStock(
      productId,
      quantity,
    )
    const currentStock =
      await this.stockDiscountService.getCurrentStock(productId)

    return {
      hasEnoughStock: hasStock,
      currentStock,
      requiredQuantity: quantity,
    }
  }

  @Post('check-multiple')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  async checkMultipleProductsStock(
    @Body() checkDto: CheckMultipleStockDto,
  ): Promise<StockCheckResponseDto[]> {
    const checks = checkDto.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
    }))

    return this.stockDiscountService.checkMultipleProductsStock(checks)
  }

  @Get('current/:productId')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  async getCurrentStock(
    @Param('productId') productId: string,
  ): Promise<{ productId: string; currentStock: number | null }> {
    const stock = await this.stockDiscountService.getCurrentStock(productId)
    return {
      productId,
      currentStock: stock,
    }
  }

  @Post('current-multiple')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  async getCurrentStockMultiple(
    @Body() stockDto: GetCurrentStockDto,
  ): Promise<CurrentStockResponseDto[]> {
    return this.stockDiscountService.getCurrentStockMultiple(
      stockDto.productIds,
    )
  }

  // Endpoint adicional para validar antes de procesar
  @Post('validate-discount')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  async validateStockDiscount(
    @Body() discountDto: MultipleProductStockDiscountDto,
  ): Promise<{
    isValid: boolean
    validProducts: string[]
    invalidProducts: { productId: string; reason: string }[]
  }> {
    const checks = discountDto.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity,
    }))

    const stockChecks =
      await this.stockDiscountService.checkMultipleProductsStock(checks)

    const validProducts: string[] = []
    const invalidProducts: { productId: string; reason: string }[] = []

    stockChecks.forEach((check) => {
      if (check.hasStock) {
        validProducts.push(check.productId)
      } else {
        invalidProducts.push({
          productId: check.productId,
          reason: `Stock insuficiente. Disponible: ${check.currentStock}, Requerido: ${check.requiredStock}`,
        })
      }
    })

    return {
      isValid: invalidProducts.length === 0,
      validProducts,
      invalidProducts,
    }
  }
}
