import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator'
import { AtributeTypeAllow } from '@/modules/atributes/atribute-types-allow.enum'

export class CreateAtributeDto {
  @ApiProperty({
    example: 'color',
    type: String,
    minLength: 3,
    maxLength: 255,
    description: 'Nombre del atributo',
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'Debe tener al menos 3 caracteres' })
  @MaxLength(255, {
    message: 'Debe tener como máximo 255 caracteres',
  })
  name: string

  @ApiProperty({
    enum: AtributeTypeAllow,
    example: AtributeTypeAllow.TEXT,
    description: 'Tipo de dato del atributo',
  })
  @IsEnum(AtributeTypeAllow, {
    message: `El tipo debe ser uno de: ${Object.values(AtributeTypeAllow).join(', ')}`,
  })
  type: AtributeTypeAllow

  @ApiPropertyOptional({
    type: [String],
    example: ['Rojo', 'Azul', 'Verde'],
    description: 'Opciones si el tipo es select, enum o similar',
  })
  @IsOptional()
  @IsArray({ message: 'Las opciones deben ser un arreglo' })
  @IsString({ each: true, message: 'Cada opción debe ser un string' })
  options?: string[]

  @ApiProperty({
    example: false,
    description: 'Indica si el atributo es obligatorio',
  })
  @IsBoolean({ message: 'Debe ser un valor booleano (true o false)' })
  required: boolean
}
