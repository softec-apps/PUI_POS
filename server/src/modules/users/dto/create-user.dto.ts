import { Transform, Type } from 'class-transformer'
import { StatusDto } from '@/statuses/dto/status.dto'
import { RoleDto } from '@/modules/roles/dto/role.dto'
import { FileDto } from '@/modules/files/dto/file.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator'
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer'

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string | null

  @ApiProperty()
  @MinLength(6)
  password?: string

  provider?: string

  socialId?: string | null

  @ApiProperty({ example: 'John', type: String })
  @IsNotEmpty()
  firstName: string | null

  @ApiProperty({ example: 'Doe', type: String })
  @IsNotEmpty()
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
