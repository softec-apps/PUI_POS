import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

export class DateRangeDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO string)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    description: 'Fecha de fin (ISO string)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string
}
