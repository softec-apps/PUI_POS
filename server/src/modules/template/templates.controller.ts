import {
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  Delete,
  HttpCode,
  UseGuards,
  Controller,
  HttpStatus,
  SerializeOptions,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '@/modules/roles/roles.decorator'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RoleEnum } from '@/common/constants/roles-const'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { Template } from '@/modules/template/domain/template'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { QueryTemplateDto } from '@/modules/template/dto/query-template.dto'
import { ParamTemplateDto } from '@/modules/template/dto/param-template.dto'
import { TemplateProductService } from '@/modules/template/templates.service'
import { CreateTemplateDto } from '@/modules/template/dto/create-template.dto'
import { UpdateTemplateDto } from '@/modules/template/dto/update-template.dto'
import { TemplateApiDocs } from '@/modules/template/docs/template-swagger.docs'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

@ApiTags(PATH_SOURCE.TEMPLATE)
@ApiBearerAuth()
@Roles(RoleEnum.Admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.TEMPLATE,
  version: '1',
})
export class TemplateProductController {
  constructor(
    private readonly templateProductService: TemplateProductService,
  ) {}

  /**
   * Create a new template.
   * @param CreateTemplateDto - Data transfer object for template creation.
   * @returns The API standard response
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SerializeOptions({ groups: ['admin'] })
  @TemplateApiDocs.create
  async create(
    @Body() createTemplateDto: CreateTemplateDto,
  ): Promise<ApiResponse<Template>> {
    return await this.templateProductService.createFullTemplate(
      createTemplateDto,
    )
  }

  /**
   * Get all templates with pagination
   * @param query - Query parameters (filtering, sort, search and pagination)
   * @returns The API standard response
   */
  @Get()
  @SerializeOptions({ groups: ['admin'] })
  @HttpCode(HttpStatus.OK)
  @TemplateApiDocs.findAll
  async findAll(
    @Query() query: QueryTemplateDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Template>>> {
    return this.templateProductService.findManyWithPagination(query)
  }

  /**
   * Get a single template by ID
   * @param param - Parameter containing the template ID
   * @returns The API standard response
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @TemplateApiDocs.findOne
  findOne(@Param() param: ParamTemplateDto): Promise<ApiResponse<Template>> {
    return this.templateProductService.findById(param.id)
  }

  /**
   * Update a template.
   * @param UpdateTemplateDto - Data transfer object for template update.
   * @returns The API standard response
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @TemplateApiDocs.update
  update(
    @Param() param: ParamTemplateDto,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<ApiResponse<Template>> {
    return this.templateProductService.update(param.id, updateTemplateDto)
  }

  /**
   * Permanently delete a template (hard delete)
   * @param param - Parameter containing the template ID to delete
   * @returns The API standard response confirming deletion
   * @warning This action is irreversible and will permanently remove the template
   */
  @Delete(':id/hard-delete')
  @HttpCode(HttpStatus.OK)
  @SerializeOptions({ groups: ['admin'] })
  @TemplateApiDocs.hardDelete
  async hardDelete(@Param() param: ParamTemplateDto): Promise<ApiResponse> {
    return await this.templateProductService.hardDelete(param.id)
  }
}
