import { DataSource } from 'typeorm'
import {
  listResponse,
  readResponse,
  createdResponse,
  deletedResponse,
  updatedResponse,
} from '@/common/helpers/responseSuccess.helper'
import { Product } from '@/modules/product/domain/product'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

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
import { FileRepository } from '@/modules/files/infrastructure/persistence/file.repository'
import { ProductRepository } from '@/modules/product/infrastructure/persistence/product.repository'
import { SupplierRepository } from '@/modules/suppliers/infrastructure/persistence/supplier.repository'
import { TemplateRepository } from '@/modules/template/infrastructure/persistence/template.repository'
import { CategoryRepository } from '@/modules/categories/infrastructure/persistence/category.repository'
import { Category } from '@/modules/categories/domain/category'
import { Brand } from '@/modules/brand/domain/brand'
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { FileType } from '@/modules/files/domain/file'
import { FilesService } from '@/modules/files/files.service'

@Injectable()
export class ProductService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly fileRepository: FileRepository,
    private readonly brandRepository: BrandRepository,
    private readonly productRepository: ProductRepository,
    private readonly supplierRepository: SupplierRepository,
    private readonly templateRepository: TemplateRepository,
    private readonly categoryRepository: CategoryRepository,

    private readonly filesService: FilesService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ApiResponse<Product>> {
    return this.dataSource.transaction(async (entityManager) => {
      if (!createProductDto.templateId) {
        throw new BadRequestException(
          'El template es obligatorio para crear un producto',
        )
      }

      const template = await this.templateRepository.findById(
        createProductDto.templateId,
      )
      if (!template) {
        throw new NotFoundException(
          `Template con ID ${createProductDto.templateId} no encontrado`,
        )
      }

      let brand: Brand | null | undefined = undefined
      if (createProductDto.brandId) {
        brand = await this.brandRepository.findById(createProductDto.brandId)
        if (!brand) {
          throw new NotFoundException(
            `Marca con ID ${createProductDto.brandId} no encontrada`,
          )
        }
      }

      let category: Category | null | undefined = undefined
      if (createProductDto.categoryId) {
        category = await this.categoryRepository.findById(
          createProductDto.categoryId,
        )
        if (!category) {
          throw new NotFoundException(
            `Categoría con ID ${createProductDto.categoryId} no encontrada`,
          )
        }
      }

      let supplier: Supplier | null | undefined = undefined
      if (createProductDto.supplierId) {
        supplier = await this.supplierRepository.findById(
          createProductDto.supplierId,
        )
        if (!supplier) {
          throw new NotFoundException(
            `Proveedor con ID ${createProductDto.supplierId} no encontrado`,
          )
        }
      }

      let photo: FileType | null | undefined = undefined
      if (createProductDto.photo?.id) {
        const fileObject = await this.filesService.findById(
          createProductDto.photo.id,
        )
        if (!fileObject) {
          throw new NotFoundException({
            message: MESSAGE_RESPONSE.NOT_FOUND.IMAGE,
          })
        }
        photo = fileObject
      } else if (createProductDto.photo === null) {
        photo = null
      }

      // Crear el producto con todas las propiedades requeridas
      await this.productRepository.create(
        {
          isVariant: createProductDto.isVariant || false,
          name: createProductDto.name,
          description: createProductDto.description || null,
          price: createProductDto.price,
          status: createProductDto.status || ProductStatus.DRAFT,
          sku: createProductDto.sku || null,
          barCode: createProductDto.barCode || null,
          stock: createProductDto.stock || 0,
          code: '',
          photo,
          brand: brand || null,
          template: template,
          category: category || null,
          supplier: supplier || null,
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

      // Actualización de propiedades básicas
      if (updateProductDto.name !== undefined) {
        updateData.name = updateProductDto.name
      }

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
        if (!Object.values(ProductStatus).includes(updateProductDto.status)) {
          throw new BadRequestException(
            `Estado inválido. Debe ser uno de: ${Object.values(ProductStatus).join(', ')}`,
          )
        }
        updateData.status = updateProductDto.status
      }

      // Actualización de propiedades numéricas
      if (updateProductDto.price !== undefined) {
        updateData.price = updateProductDto.price
      }

      if (updateProductDto.stock !== undefined) {
        updateData.stock = updateProductDto.stock
      }

      // Actualización de códigos identificadores
      if (updateProductDto.sku !== undefined) {
        updateData.sku = updateProductDto.sku || null
      }

      if (updateProductDto.barCode !== undefined) {
        updateData.barCode = updateProductDto.barCode || null
      }

      // Actualización de isVariant si está presente
      if (updateProductDto.isVariant !== undefined) {
        updateData.isVariant = updateProductDto.isVariant
      }

      // Manejo de relaciones con validación
      if (updateProductDto.brandId !== undefined) {
        if (updateProductDto.brandId) {
          const brand = await this.brandRepository.findById(
            updateProductDto.brandId,
          )
          if (!brand) {
            throw new NotFoundException(
              `Marca con ID ${updateProductDto.brandId} no encontrada`,
            )
          }
          updateData.brand = brand
        } else {
          updateData.brand = null
        }
      }

      if (updateProductDto.templateId !== undefined) {
        if (updateProductDto.templateId) {
          const template = await this.templateRepository.findById(
            updateProductDto.templateId,
          )
          if (!template) {
            throw new NotFoundException(
              `Template con ID ${updateProductDto.templateId} no encontrado`,
            )
          }
          updateData.template = template
        } else {
          // El template es obligatorio según tu DTO de creación
          throw new BadRequestException(
            'El template es obligatorio y no puede ser null',
          )
        }
      }

      if (updateProductDto.categoryId !== undefined) {
        if (updateProductDto.categoryId) {
          const category = await this.categoryRepository.findById(
            updateProductDto.categoryId,
          )
          if (!category) {
            throw new NotFoundException(
              `Categoría con ID ${updateProductDto.categoryId} no encontrada`,
            )
          }
          updateData.category = category
        } else {
          updateData.category = null
        }
      }

      if (updateProductDto.supplierId !== undefined) {
        if (updateProductDto.supplierId) {
          const supplier = await this.supplierRepository.findById(
            updateProductDto.supplierId,
          )
          if (!supplier) {
            throw new NotFoundException(
              `Proveedor con ID ${updateProductDto.supplierId} no encontrado`,
            )
          }
          updateData.supplier = supplier
        } else {
          updateData.supplier = null
        }
      }

      // Manejo de la foto
      if (updateProductDto.photo !== undefined) {
        if (updateProductDto.photo?.id) {
          const fileObject = await this.filesService.findById(
            updateProductDto.photo.id,
          )
          if (!fileObject) {
            throw new NotFoundException({
              message: MESSAGE_RESPONSE.NOT_FOUND.IMAGE,
            })
          }
          updateData.photo = fileObject
        } else if (updateProductDto.photo === null) {
          updateData.photo = null
        }
      }

      // Verificar que hay algo que actualizar
      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException('No hay datos para actualizar')
      }

      // Ejecutar la actualización
      const updatedProduct = await this.productRepository.update(
        id,
        updateData,
        entityManager,
      )

      return updatedResponse({
        resource: PATH_SOURCE.PRODUCT,
        message: MESSAGE_RESPONSE.UPDATED,
        data: updatedProduct, // Opcional: incluir el producto actualizado
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
  private async validateRelations(createProductDto: CreateProductDto): Promise<{
    brand?: any
    category?: any
    supplier?: any
    template: any
    photo?: any
  }> {
    const relations: any = {}

    // Template es obligatorio
    relations.template = await this.templateRepository.findById(
      createProductDto.templateId,
    )
    if (!relations.template) {
      throw new NotFoundException(
        `Template con ID ${createProductDto.templateId} no encontrado`,
      )
    }

    // Relaciones opcionales
    if (createProductDto.brandId) {
      relations.brand = await this.brandRepository.findById(
        createProductDto.brandId,
      )
      if (!relations.brand) {
        throw new NotFoundException(
          `Marca con ID ${createProductDto.brandId} no encontrada`,
        )
      }
    }

    if (createProductDto.categoryId) {
      relations.category = await this.categoryRepository.findById(
        createProductDto.categoryId,
      )
      if (!relations.category) {
        throw new NotFoundException(
          `Categoría con ID ${createProductDto.categoryId} no encontrada`,
        )
      }
    }

    if (createProductDto.supplierId) {
      relations.supplier = await this.supplierRepository.findById(
        createProductDto.supplierId,
      )
      if (!relations.supplier) {
        throw new NotFoundException(
          `Proveedor con ID ${createProductDto.supplierId} no encontrado`,
        )
      }
    }

    if (createProductDto.photo) {
      relations.photo = await this.fileRepository.findById(
        createProductDto.photo.id,
      )
      if (!relations.photo) {
        throw new NotFoundException(
          `Archivo con ID ${createProductDto.photo} no encontrado`,
        )
      }
    }

    return relations
  }
}
