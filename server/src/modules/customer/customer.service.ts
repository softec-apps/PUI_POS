import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { DataSource } from 'typeorm'
import {
  listResponse,
  readResponse,
  createdResponse,
  deletedResponse,
  updatedResponse,
} from '@/common/helpers/responseSuccess.helper'
import { Customer } from '@/modules/customer/domain/customer'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'
import { QueryCustomerDto } from '@/modules/customer/dto/query-customer.dto'
import { CreateCustomerDto } from '@/modules/customer/dto/create-customer.dto'
import { UpdateCustomerDto } from '@/modules/customer/dto/update-customer.dto'
import { MESSAGE_RESPONSE } from '@/modules/customer/messages/responseOperation.message'
import { CustomerRepository } from '@/modules/customer/infrastructure/persistence/customer.repository'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'
import { CustomerType, IdentificationType } from './customer.enum'
import { SaleService } from '@/modules/sales/sale.service'

@Injectable()
export class CustomerService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly customerRepository: CustomerRepository,
    private readonly saleService: SaleService,
  ) {}

  async create(
    createCustomerDto: CreateCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    return this.dataSource.transaction(async (entityManager) => {
      // Validate Final Consumer case
      if (
        createCustomerDto.identificationType ===
        IdentificationType.FINAL_CONSUMER
      ) {
        if (createCustomerDto.identificationNumber !== '9999999999999') {
          throw new BadRequestException({
            message: MESSAGE_RESPONSE.VALIDATION.FINAL_CONSUMER,
          })
        }
      }

      // Check duplicate identification number
      if (createCustomerDto.identificationNumber) {
        const existingCustomer = await this.customerRepository.findByField(
          'identificationNumber',
          createCustomerDto.identificationNumber,
        )
        if (existingCustomer) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE.CONFLICT.IDENTIFICATION,
          })
        }
      }

      // Check duplicate email
      if (createCustomerDto.email) {
        const existingEmail = await this.customerRepository.findByField(
          'email',
          createCustomerDto.email,
        )
        if (existingEmail) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE.CONFLICT.EMAIL,
          })
        }
      }

      // Set customer type with proper validation
      const customerType =
        createCustomerDto.customerType &&
        Object.values(CustomerType).includes(createCustomerDto.customerType)
          ? createCustomerDto.customerType
          : CustomerType.REGULAR // Default to REGULAR instead of FINAL_CONSUMER

      // Set identification type with proper validation
      const identificationType =
        createCustomerDto.identificationType &&
        Object.values(IdentificationType).includes(
          createCustomerDto.identificationType,
        )
          ? createCustomerDto.identificationType
          : IdentificationType.IDENTIFICATION_CARD // Default to ID CARD

      // Create the customer domain object
      const customerDomain = new Customer()
      customerDomain.customerType = customerType
      customerDomain.identificationType = identificationType
      customerDomain.identificationNumber =
        createCustomerDto.identificationNumber || null
      customerDomain.firstName = createCustomerDto.firstName || null
      customerDomain.lastName = createCustomerDto.lastName || null
      customerDomain.email = createCustomerDto.email || null
      customerDomain.phone = createCustomerDto.phone || null
      customerDomain.address = createCustomerDto.address || null
      // Timestamps will be set by the database/entity

      await this.customerRepository.create(customerDomain, entityManager)

      return createdResponse({
        resource: PATH_SOURCE.CUSTOMER,
        message: MESSAGE_RESPONSE.CREATED,
      })
    })
  }

  async findManyWithPagination(
    query: QueryCustomerDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Customer>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10

    // Si el límite es 9999, marcar para obtener todos los registros
    const isGetAll = limit === 9999

    if (!isGetAll && limit > 50) limit = 50

    // Si es obtener todos, usar un límite muy alto para la consulta inicial
    const queryLimit = isGetAll ? Number.MAX_SAFE_INTEGER : limit

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.customerRepository.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page: isGetAll ? 1 : page,
          limit: queryLimit,
        },
        searchOptions: query?.search,
      })

    // Para el caso de obtener todos, ajustar los parámetros de paginación
    const finalPage = isGetAll ? 1 : page
    const finalLimit = isGetAll ? totalCount : limit

    // Formatear respuesta paginada con la utilidad
    const paginatedData = infinityPaginationWithMetadata(
      data,
      {
        page: finalPage,
        limit: finalLimit,
      },
      totalCount,
      totalRecords,
    )

    return listResponse({
      data: paginatedData,
      resource: PATH_SOURCE.USER,
      message: MESSAGE_RESPONSE.LISTED,
    })
  }

  async findById(id: Customer['id']): Promise<ApiResponse<Customer>> {
    const result = await this.customerRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE.NOT_FOUND.ID,
      })
    }

    return readResponse({
      data: result,
      resource: PATH_SOURCE.CUSTOMER,
      message: MESSAGE_RESPONSE.READED,
    })
  }

  async findByIds(ids: Customer['id'][]): Promise<Customer[]> {
    return this.customerRepository.findByIds(ids)
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    return this.dataSource.transaction(async (entityManager) => {
      // 1. Verificar existencia del cliente
      const existingCustomer = await this.customerRepository.findById(id)
      if (!existingCustomer) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      // 2. Validar Consumidor Final
      if (
        updateCustomerDto.identificationType ===
        IdentificationType.FINAL_CONSUMER
      ) {
        if (updateCustomerDto.identificationNumber !== '9999999999999') {
          throw new BadRequestException({
            message: MESSAGE_RESPONSE.VALIDATION.FINAL_CONSUMER,
          })
        }
      }

      // 3. Validar duplicados (solo si se están actualizando estos campos)
      if (updateCustomerDto.identificationNumber) {
        const customerWithSameId = await this.customerRepository.findByField(
          'identificationNumber',
          updateCustomerDto.identificationNumber,
        )
        if (customerWithSameId && customerWithSameId.id !== id) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE.CONFLICT.IDENTIFICATION,
          })
        }
      }

      if (updateCustomerDto.email) {
        const customerWithSameEmail = await this.customerRepository.findByField(
          'email',
          updateCustomerDto.email,
        )
        if (customerWithSameEmail && customerWithSameEmail.id !== id) {
          throw new ConflictException({
            message: MESSAGE_RESPONSE.CONFLICT.EMAIL,
          })
        }
      }

      // 4. Validar y establecer valores por defecto
      const customerType =
        updateCustomerDto.customerType &&
        Object.values(CustomerType).includes(updateCustomerDto.customerType)
          ? updateCustomerDto.customerType
          : existingCustomer.customerType

      const identificationType =
        updateCustomerDto.identificationType &&
        Object.values(IdentificationType).includes(
          updateCustomerDto.identificationType,
        )
          ? updateCustomerDto.identificationType
          : existingCustomer.identificationType

      // 5. Actualizar el cliente
      await this.customerRepository.update(
        id,
        {
          ...updateCustomerDto,
          customerType,
          identificationType,
        },
        entityManager,
      )

      return updatedResponse({
        resource: PATH_SOURCE.CUSTOMER,
        message: MESSAGE_RESPONSE.UPDATED,
      })
    })
  }

  async restore(id: Customer['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const customer = await this.customerRepository.findById(id)

      if (!customer) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.customerRepository.restore(id, entityManager)

      return updatedResponse({
        resource: PATH_SOURCE.CUSTOMER,
        message: MESSAGE_RESPONSE.RESTORED,
      })
    })
  }

  async hardDelete(id: Customer['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const customer = await this.customerRepository.findById(id)

      if (!customer) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      const isSales = await this.saleService.findByCustomerId(customer.id)

      if (isSales) {
        throw new ConflictException({
          message: MESSAGE_RESPONSE.CONFLICT.IS_SALES,
        })
      }

      await this.customerRepository.hardDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.CUSTOMER,
        message: MESSAGE_RESPONSE.DELETED.HARD,
      })
    })
  }
}
