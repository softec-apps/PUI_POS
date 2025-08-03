import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'

import {
  CreateKardexResponseDto,
  FindOneKardexResponseDto,
  FindAllKardexResponseDto,
} from '@/modules/kardex/dto/response-kardex.dto'
import { ParamKardexDto } from '@/modules/kardex/dto/param-kardex.dto'
import { QueryKardexDto } from '@/modules/kardex/dto/query-kardex.dto'

const crudDocs = CreateCrudApiDocs({
  responseDto: CreateKardexResponseDto,
  paramDto: ParamKardexDto,
  queryDto: QueryKardexDto,
  requiresAuth: true,
})

export const KardexApiDocs = {
  findOne: crudDocs.findOne({
    summary: 'Retrieve kardex by ID',
    description: 'Fetches the details of a specific kardex using its ID.',
    responseDto: FindOneKardexResponseDto,
    customResponses: {
      notFound: 'The requested kardex does not exist.',
      forbidden: 'Insufficient permissions to view this kardex.',
    },
  }),

  findAll: crudDocs.findAll({
    summary: 'List kardex',
    description:
      'Retrieves a list of kardex with pagination and filtering options.',
    responseDto: FindAllKardexResponseDto,
  }),

  findAllLasted: crudDocs.findAll({
    summary: 'List kardex lasted product',
    description:
      'Retrieves a list of kardex with pagination and filtering options.',
    responseDto: FindAllKardexResponseDto,
  }),
}
