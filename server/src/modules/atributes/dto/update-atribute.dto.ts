import {
  IsEnum,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator'
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { CreateAtributeDto } from '@/modules/atributes/dto/create-atribute.dto'
import { AtributeTypeAllow } from '@/modules/atributes/atribute-types-allow.enum'

export class UpdateAtributeDto extends PartialType(CreateAtributeDto) {
  @ApiPropertyOptional({
    example: 'color',
    type: String,
    minLength: 3,
    maxLength: 255,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(3, { message: 'Debe tener al menos 3 caracteres' })
  @MaxLength(255, {
    message: 'Debe tener como máximo 255 caracteres',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string

  @ApiPropertyOptional({
    enum: AtributeTypeAllow,
    example: AtributeTypeAllow.TEXT,
  })
  @IsOptional()
  @IsEnum(AtributeTypeAllow, {
    message: `El tipo debe ser uno de los siguientes valores: ${Object.values(AtributeTypeAllow).join(', ')}`,
  })
  type?: AtributeTypeAllow

  @ApiPropertyOptional({
    type: [String],
    example: ['Rojo', 'Azul', 'Verde'],
    description: 'Opciones disponibles si el tipo lo permite',
  })
  @IsOptional()
  @IsArray({ message: 'Las opciones deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada opción debe ser un string' })
  options?: string[]

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si el atributo es obligatorio',
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo debe ser booleano' })
  required?: boolean
}
