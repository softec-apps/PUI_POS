import { Transform, Type } from 'class-transformer'
import { StatusDto } from '@/statuses/dto/status.dto'
import { FileDto } from '@/modules/files/dto/file.dto'
import { RoleDto } from '@/modules/roles/dto/role.dto'
import { IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator'
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger'
import { CreateUserDto } from '@/modules/users/dto/create-user.dto'
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'test1@example.com',
    type: 'string',
    maxLength: 255,
  })
  //@Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  email?: string | null

  @ApiPropertyOptional({
    type: 'string',
    minLength: 8,
    maxLength: 12,
    example: 'pass12345678',
  })
  @IsOptional()
  @MinLength(8, { message: 'El password debe tener mínimo 8 caracteres' })
  @MaxLength(12, { message: 'El password debe tener máximo 12 caracteres' })
  password?: string

  @ApiPropertyOptional({
    type: 'string',
    minLength: 8,
    maxLength: 12,
    example: 'pass12345678',
  })
  @IsOptional()
  @MinLength(8, { message: 'El password debe tener mínimo 8 caracteres' })
  @MaxLength(12, { message: 'El password debe tener máximo 12 caracteres' })
  passwordConfirm?: string

  provider?: string

  socialId?: string | null

  @ApiPropertyOptional({ example: 'John', type: 'string', maxLength: 255 })
  @IsOptional()
  firstName?: string | null

  @ApiPropertyOptional({ example: 'Doe', type: 'string', maxLength: 255 })
  @IsOptional()
  lastName?: string | null

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null

  @ApiPropertyOptional({ type: () => RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto
}
