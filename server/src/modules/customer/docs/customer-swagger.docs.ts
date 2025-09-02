import { ROLES } from '@/common/constants/roles-const'
import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'
import {
  CreateCustomerResponseDto,
  UpdateCustomerResponseDto,
  FindOneCustomerResponseDto,
  FindAllCustomerResponseDto,
  HardDeleteCustomerResponseDto,
} from '@/modules/customer/dto/response-customer.dto'
import { ParamCustomerDto } from '@/modules/customer/dto/param-customer.dto'
import { QueryCustomerDto } from '@/modules/customer/dto/query-customer.dto'
import { CreateCustomerDto } from '@/modules/customer/dto/create-customer.dto'
import { UpdateCustomerDto } from '@/modules/customer/dto/update-customer.dto'

const crudDocs = CreateCrudApiDocs({
  createDto: CreateCustomerDto,
  updateDto: UpdateCustomerDto,
  responseDto: CreateCustomerResponseDto,
  paramDto: ParamCustomerDto,
  queryDto: QueryCustomerDto,
  requiresAuth: true,
  serializeGroups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER],
})

export const CustomerApiDocs = {
  create: crudDocs.create({
    summary: 'Crear un nuevo cliente',
    description:
      'Crea un nuevo cliente. Requiere privilegios de administrador, manager o ventas.',
    responseDto: CreateCustomerResponseDto,
    customResponses: {
      badRequest:
        'Datos inválidos en la solicitud o número de identificación incorrecto.',
      conflict:
        'Ya existe un cliente con este número de identificación o correo electrónico.',
      forbidden: 'Permisos insuficientes para crear clientes.',
    },
  }),

  findOne: crudDocs.findOne({
    summary: 'Obtener cliente por ID',
    description: 'Recupera los detalles de un cliente específico usando su ID.',
    responseDto: FindOneCustomerResponseDto,
    customResponses: {
      notFound: 'El cliente solicitado no existe.',
      forbidden: 'Permisos insuficientes para ver este cliente.',
    },
  }),

  findAll: crudDocs.findAll({
    summary: 'Listar clientes',
    description:
      'Recupera una lista de clientes con opciones de paginación y filtrado.',
    responseDto: FindAllCustomerResponseDto,
  }),

  update: crudDocs.update({
    summary: 'Actualizar cliente',
    description:
      'Actualiza los datos de un cliente existente. Requiere privilegios de administrador, manager o ventas.',
    responseDto: UpdateCustomerResponseDto,
    customResponses: {
      badRequest: 'Datos inválidos para actualizar el cliente.',
      notFound: 'El cliente a actualizar no existe.',
      conflict:
        'El nuevo número de identificación o correo electrónico ya está en uso por otro cliente.',
      forbidden: 'Permisos insuficientes para modificar clientes.',
    },
  }),

  hardDelete: crudDocs.hardDelete({
    summary: 'Eliminar cliente permanentemente',
    description:
      'Elimina permanentemente un cliente y todos sus datos asociados. Esta acción no se puede deshacer. Requiere privilegios de administrador.',
    responseDto: HardDeleteCustomerResponseDto,
    customResponses: {
      notFound: 'El cliente a eliminar no existe.',
      forbidden:
        'Permisos insuficientes para eliminar permanentemente clientes.',
    },
  }),
}
