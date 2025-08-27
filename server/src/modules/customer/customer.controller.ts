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
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { Customer } from '@/modules/customer/domain/customer'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { CustomerService } from '@/modules/customer/customer.service'
import { ParamCustomerDto } from '@/modules/customer/dto/param-customer.dto'
import { QueryCustomerDto } from '@/modules/customer/dto/query-customer.dto'
import { CreateCustomerDto } from '@/modules/customer/dto/create-customer.dto'
import { UpdateCustomerDto } from '@/modules/customer/dto/update-customer.dto'
import { CustomerApiDocs } from '@/modules/customer/docs/customer-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.CUSTOMER)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.CUSTOMER,
  version: '1',
})
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  /**
   * Create a new customer.
   * @param createCustomerDto - Data transfer object for customer creation.
   * @returns The API standard response
   */
  @Post()
  @CustomerApiDocs.create
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    console.log('RES', createCustomerDto)
    return await this.customerService.create(createCustomerDto)
  }

  /**
   * Get all customers with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @CustomerApiDocs.findAll
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryCustomerDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Customer>>> {
    return await this.customerService.findManyWithPagination(query)
  }

  /**
   * Get customer
   * @param param - Parameter containing the customer ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @CustomerApiDocs.findOne
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param() param: ParamCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    return await this.customerService.findById(param.id)
  }

  /**
   * Update a customer.
   * @param UpdateCustomerDto - Data transfer object for customer update.
   * @returns The API standard response
   */
  @Put(':id')
  @CustomerApiDocs.update
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param() param: ParamCustomerDto,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    return await this.customerService.update(param.id, updateCustomerDto)
  }

  /**
   * Permanently delete a customer (hard delete)
   * @param param - Parameter containing the customer ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the customer
   */
  @Delete(':id/hard-delete')
  @CustomerApiDocs.hardDelete
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  @HttpCode(HttpStatus.OK)
  hardDelete(@Param() param: ParamCustomerDto): Promise<ApiResponse> {
    return this.customerService.hardDelete(param.id)
  }
}
