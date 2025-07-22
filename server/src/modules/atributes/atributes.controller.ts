import {
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  SerializeOptions,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '@/modules/roles/roles.decorator'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { RoleEnum } from '@/common/constants/roles-const'
import { Atribute } from '@/modules/atributes/domain/atribute'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { AtributesService } from '@/modules/atributes/atributes.service'
import { QueryAtributeDto } from '@/modules/atributes/dto/query-atribute.dto'
import { ParamAtributeDto } from '@/modules/atributes/dto/param-atribute.dto'
import { CreateAtributeDto } from '@/modules/atributes/dto/create-atribute.dto'
import { UpdateAtributeDto } from '@/modules/atributes/dto/update-atribute.dto'
import { AtributeApiDocs } from '@/modules/atributes/docs/atribute-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.ATRIBUTE)
@ApiBearerAuth()
@Roles(RoleEnum.Admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.ATRIBUTE,
  version: '1',
})
export class AtributeController {
  constructor(private readonly atributesService: AtributesService) {}

  /**
   * Create a new atribute.
   * @param createCategoryDto - Data transfer object for atribute creation.
   * @returns The API standard response
   */
  @Post()
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.CREATED)
  @AtributeApiDocs.create
  async create(
    @Body() createAtributeDto: CreateAtributeDto,
  ): Promise<ApiResponse<Atribute>> {
    return await this.atributesService.create(createAtributeDto)
  }

  /**
   * Get all atributes with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.OK)
  @AtributeApiDocs.findAll
  async findAll(
    @Query() query: QueryAtributeDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Atribute>>> {
    return await this.atributesService.findManyWithPagination(query)
  }

  /**
   * Get all atribute with pagination
   * @param param - Parameter containing the template ID
   * @returns The API standard response
   *
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @AtributeApiDocs.findOne
  async findOne(
    @Param() param: ParamAtributeDto,
  ): Promise<ApiResponse<Atribute>> {
    return await this.atributesService.findById(param.id)
  }

  /**
   * Update a atribute.
   * @param UpdateAtributeDto - Data transfer object for atribute update.
   * @returns The API standard response
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @AtributeApiDocs.update
  async update(
    @Param() param: ParamAtributeDto,
    @Body() updateAtributeDto: UpdateAtributeDto,
  ): Promise<ApiResponse<Atribute>> {
    return await this.atributesService.update(param.id, updateAtributeDto)
  }

  /**
   * Permanently delete a atribute (hard delete)
   * @param param - Parameter containing the atribute ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the atribute
   */
  @Delete(':id/hard-delete')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @AtributeApiDocs.hardDelete
  async hardDelete(
    @Param('id') id: Atribute['id'],
  ): Promise<ApiResponse<void>> {
    return await this.atributesService.hardDelete(id)
  }
}
