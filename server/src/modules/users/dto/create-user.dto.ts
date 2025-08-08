import { Transform, Type } from 'class-transformer'
import { StatusDto } from '@/statuses/dto/status.dto'
import { RoleDto } from '@/modules/roles/dto/role.dto'
import { FileDto } from '@/modules/files/dto/file.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator'
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer'

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: 'string', maxLength: 255 })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  //@Transform(lowerCaseTransformer)
  @IsEmail()
  email: string | null

  @ApiProperty({
    type: 'string',
    minLength: 8,
    maxLength: 12,
    example: 'pass12345678',
  })
  @MinLength(8, { message: 'El password debe tener mínimo 8 caracteres' })
  @MaxLength(12, { message: 'El password debe tener máximo 12 caracteres' })
  password?: string

  @ApiProperty({
    type: 'string',
    minLength: 8,
    maxLength: 12,
    example: 'pass12345678',
  })
  @MinLength(8, { message: 'El password debe tener mínimo 8 caracteres' })
  @MaxLength(12, { message: 'El password debe tener máximo 12 caracteres' })
  passwordConfirm?: string

  provider?: string

  socialId?: string | null

  @ApiProperty({ example: 'John', type: 'string', maxLength: 255 })
  @IsNotEmpty({ message: 'El firstName  es obligatorio' })
  firstName: string | null

  @ApiProperty({ example: 'Doe', type: 'string', maxLength: 255 })
  @IsNotEmpty({ message: 'El lastName es obligatorio' })
  lastName: string | null

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null

  @ApiPropertyOptional({ type: RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null

  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto
}
