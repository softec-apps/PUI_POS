import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'
import { ParamSaleDto } from '@/modules/sales/dto/param-sale.dto'
import { QuerySaleDto } from '@/modules/sales/dto/query-sale.dto'
import { CreateSaleDto } from '@/modules/sales/dto/create-sale.dto'
import {
  CreateSaleResponseDto,
  FindOneSaleResponseDto,
  FindAllSaleResponseDto,
} from '@/modules/sales/dto/response-sale.dto'

const crudDocs = CreateCrudApiDocs({
  createDto: CreateSaleDto,
  responseDto: CreateSaleResponseDto,
  paramDto: ParamSaleDto,
  queryDto: QuerySaleDto,
  requiresAuth: true,
  serializeGroups: ['admin'],
})

export const SaleApiDocs = {
  create: crudDocs.create({
    summary: 'Crear una nueva venta',
    description: 'Crear una nueva venta con sus atributos asociados',
    responseDto: CreateSaleResponseDto,
    customResponses: {
      badRequest: 'Datos de venta inválidos - Verificar nombre y atributos',
      conflict: 'Ya existe una venta con este nombre',
      forbidden: 'Solo administradores pueden crear ventas',
    },
  }),

  findOne: crudDocs.findOne({
    summary: 'Obtener venta por ID',
    description: 'Obtener los detalles de una venta específica',
    responseDto: FindOneSaleResponseDto,
    customResponses: {
      notFound: 'La venta especificada no existe',
      forbidden: 'Sin permisos para ver esta venta',
    },
  }),

  findAll: crudDocs.findAll({
    summary: 'Listar ventas',
    description: 'Obtener lista de ventas con paginación y filtros',
    responseDto: FindAllSaleResponseDto,
  }),
}
