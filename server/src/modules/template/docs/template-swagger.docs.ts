import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'
import { ParamTemplateDto } from '@/modules/template/dto/param-template.dto'
import { QueryTemplateDto } from '@/modules/template/dto/query-template.dto'
import { CreateTemplateDto } from '@/modules/template/dto/create-template.dto'
import { UpdateTemplateDto } from '@/modules/template/dto/update-template.dto'
import {
  CreateTemplateResponseDto,
  UpdateTemplateResponseDto,
  FindOneTemplateResponseDto,
  FindAllTemplateResponseDto,
  DeleteTemplateResponseDto,
  HardDeleteTemplateResponseDto,
} from '@/modules/template/dto/response-template.dto'

const templateCrudDocs = CreateCrudApiDocs({
  createDto: CreateTemplateDto,
  updateDto: UpdateTemplateDto,
  responseDto: CreateTemplateResponseDto,
  paramDto: ParamTemplateDto,
  queryDto: QueryTemplateDto,
  requiresAuth: true,
  serializeGroups: ['admin'],
})

export const TemplateApiDocs = {
  create: templateCrudDocs.create({
    summary: 'Crear una nueva plantilla',
    description: 'Crear una nueva plantilla con sus atributos asociados',
    responseDto: CreateTemplateResponseDto,
    customResponses: {
      badRequest: 'Datos de plantilla inválidos - Verificar nombre y atributos',
      conflict: 'Ya existe una plantilla con este nombre',
      forbidden: 'Solo administradores pueden crear plantillas',
    },
  }),

  findOne: templateCrudDocs.findOne({
    summary: 'Obtener plantilla por ID',
    description: 'Obtener los detalles de una plantilla específica',
    responseDto: FindOneTemplateResponseDto,
    customResponses: {
      notFound: 'La plantilla especificada no existe',
      forbidden: 'Sin permisos para ver esta plantilla',
    },
  }),

  findAll: templateCrudDocs.findAll({
    summary: 'Listar plantillas',
    description: 'Obtener lista de plantillas con paginación y filtros',
    responseDto: FindAllTemplateResponseDto,
  }),

  update: templateCrudDocs.update({
    summary: 'Actualizar plantilla',
    description: 'Actualizar los datos de una plantilla existente',
    responseDto: UpdateTemplateResponseDto,
    customResponses: {
      badRequest: 'Datos de actualización inválidos - Verificar formato',
      notFound: 'La plantilla a actualizar no existe',
      conflict: 'El nuevo nombre ya está en uso por otra plantilla',
      forbidden: 'Solo administradores pueden modificar plantillas',
    },
  }),

  delete: templateCrudDocs.delete({
    summary: 'Eliminar plantilla',
    description: 'Desactivar una plantilla (eliminación suave)',
    responseDto: DeleteTemplateResponseDto,
    customResponses: {
      notFound: 'La plantilla a eliminar no existe',
      forbidden: 'Solo administradores pueden eliminar plantillas',
    },
  }),

  hardDelete: templateCrudDocs.hardDelete({
    summary: 'Eliminar plantilla permanentemente',
    description:
      'Eliminar permanentemente una plantilla y todos sus datos asociados. Esta acción no se puede deshacer.',
    responseDto: HardDeleteTemplateResponseDto,
    customResponses: {
      notFound: 'La plantilla a eliminar no existe',
      forbidden:
        'Solo super administradores pueden eliminar plantillas permanentemente',
    },
  }),
}
