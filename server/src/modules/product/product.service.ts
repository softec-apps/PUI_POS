import { DataSource } from 'typeorm'
import {
  listResponse,
  readResponse,
  createdResponse,
  deletedResponse,
  updatedResponse,
} from '@/common/helpers/responseSuccess.helper'
import { Product } from '@/modules/product/domain/product'
import { Injectable, NotFoundException } from '@nestjs/common'

import { ProductStatus } from '@/modules/product/status.enum'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'

import { QueryProductDto } from '@/modules/product/dto/query-product.dto'
import { CreateProductDto } from '@/modules/product/dto/create-product.dto'
import { UpdateProductDto } from '@/modules/product/dto/update-product.dto'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

import { MESSAGE_RESPONSE } from '@/modules/product/messages/responseOperation.message'

import { BrandRepository } from '@/modules/brand/infrastructure/persistence/brand.repository'
import { ProductRepository } from '@/modules/product/infrastructure/persistence/product.repository'
import { TemplateRepository } from '@/modules/template/infrastructure/persistence/template.repository'
import { CategoryRepository } from '@/modules/categories/infrastructure/persistence/category.repository'

@Injectable()
export class ProductService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly productRepository: ProductRepository,
    private readonly brandRepository: BrandRepository,
    private readonly templateRepository: TemplateRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ApiResponse<Product>> {
    return this.dataSource.transaction(async (entityManager) => {
      // Validación y asignación del status con valor por defecto
      const status =
        createProductDto.status &&
        Object.values(ProductStatus).includes(createProductDto.status)
          ? createProductDto.status
          : ProductStatus.ACTIVE

      // Generar código del producto (implementación de ejemplo)
      const code = this.generateProductCode()

      // Verificar relaciones opcionales
      const brand = createProductDto.brandId
        ? await this.brandRepository.findById(createProductDto.brandId)
        : null

      const template = createProductDto.templateId
        ? await this.templateRepository.findById(createProductDto.templateId)
        : null

      const category = createProductDto.categoryId
        ? await this.categoryRepository.findById(createProductDto.categoryId)
        : null

      // Crear el producto
      await this.productRepository.create(
        {
          code,
          name: createProductDto.name,
          description: createProductDto.description || null,
          status,
          basePrice: createProductDto.basePrice,
          sku: createProductDto.sku || null,
          barCode: createProductDto.barcode || null,
          stock: createProductDto.stock || 0,
          brand,
          template,
          category,
        },
        entityManager,
      )

      return createdResponse({
        resource: PATH_SOURCE.PRODUCT,
        message: MESSAGE_RESPONSE.CREATED,
      })
    })
  }

  async findManyWithPagination(
    query: QueryProductDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Product>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10
    if (limit > 50) limit = 50

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.productRepository.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: { page, limit },
        searchOptions: query?.search,
      })

    // Formatear respuesta paginada con la utilidad
    const paginatedData = infinityPaginationWithMetadata(
      data,
      { page, limit },
      totalCount,
      totalRecords,
    )

    return listResponse({
      data: paginatedData,
      resource: PATH_SOURCE.PRODUCT,
      message: MESSAGE_RESPONSE.LISTED,
    })
  }

  async findById(id: Product['id']): Promise<ApiResponse<Product>> {
    const result = await this.productRepository.findById(id)

    if (!result) {
      throw new NotFoundException({
        message: MESSAGE_RESPONSE.NOT_FOUND.ID,
      })
    }

    return readResponse({
      data: result,
      resource: PATH_SOURCE.PRODUCT,
      message: MESSAGE_RESPONSE.READED,
    })
  }

  async findByIds(ids: Product['id'][]): Promise<Product[]> {
    return this.productRepository.findByIds(ids)
  }

  async update(
    id: Product['id'],
    updateProductDto: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    return this.dataSource.transaction(async (entityManager) => {
      // Verificar que el producto exista antes de actualizar
      const existingProduct = await this.productRepository.findById(id)
      if (!existingProduct) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      // Preparar objeto de actualización
      const updateData: Partial<Product> = {}

      // Manejo de la descripción
      if (updateProductDto.description !== undefined) {
        updateData.description =
          updateProductDto.description === '' ||
          updateProductDto.description === null
            ? null
            : updateProductDto.description
      }

      // Validación del status
      if (updateProductDto.status !== undefined) {
        updateData.status = Object.values(ProductStatus).includes(
          updateProductDto.status,
        )
          ? updateProductDto.status
          : ProductStatus.ACTIVE
      }

      // Actualización de propiedades numéricas
      if (updateProductDto.basePrice !== undefined) {
        updateData.basePrice = updateProductDto.basePrice
      }

      if (updateProductDto.stock !== undefined) {
        updateData.stock = updateProductDto.stock
      }

      // Actualización de códigos identificadores
      if (updateProductDto.sku !== undefined) {
        updateData.sku = updateProductDto.sku || null
      }

      if (updateProductDto.barcode !== undefined) {
        updateData.barCode = updateProductDto.barcode || null
      }

      // Manejo de relaciones
      if (updateProductDto.brandId !== undefined) {
        updateData.brand = updateProductDto.brandId
          ? await this.brandRepository.findById(updateProductDto.brandId)
          : null
      }

      if (updateProductDto.templateId !== undefined) {
        updateData.template = updateProductDto.templateId
          ? await this.templateRepository.findById(updateProductDto.templateId)
          : null
      }

      if (updateProductDto.categoryId !== undefined) {
        updateData.category = updateProductDto.categoryId
          ? await this.categoryRepository.findById(updateProductDto.categoryId)
          : null
      }

      // Ejecutar la actualización
      await this.productRepository.update(id, updateData, entityManager)

      return updatedResponse({
        resource: PATH_SOURCE.PRODUCT,
        message: MESSAGE_RESPONSE.UPDATED,
      })
    })
  }

  async restore(id: Product['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const product = await this.productRepository.findById(id)

      if (!product) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.productRepository.update(
        id,
        {
          status: ProductStatus.ACTIVE,
        },
        entityManager,
      )

      await this.productRepository.restore(id, entityManager)

      return updatedResponse({
        resource: PATH_SOURCE.PRODUCT,
        message: MESSAGE_RESPONSE.RESTORED,
      })
    })
  }

  async hardDelete(id: Product['id']): Promise<ApiResponse<void>> {
    return this.dataSource.transaction(async (entityManager) => {
      const product = await this.productRepository.findById(id)

      if (!product) {
        throw new NotFoundException({
          message: MESSAGE_RESPONSE.NOT_FOUND.ID,
        })
      }

      await this.productRepository.hardDelete(id, entityManager)

      return deletedResponse({
        resource: PATH_SOURCE.PRODUCT,
        message: MESSAGE_RESPONSE.DELETED.HARD,
      })
    })
  }

  /*
   * METHODS PRIVATES
   **/
  private generateProductCode(): string {
    const uuidPart = Math.random().toString(36).substring(2, 10).toUpperCase()
    const sequencePart = '00001' // TODO: cambiar por el campo real de la tabla
    return `PROD-${uuidPart}-${sequencePart}`
  }
}
