import { Role } from '@/modules/roles/domain/role'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Status } from '@/statuses/domain/status'
import { Exclude, Expose } from 'class-transformer'
import { FileType } from '@/modules/files/domain/file'

export class User {
  @ApiProperty({
    type: String,
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
  })
  id: string

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null

  @ApiPropertyOptional({
    type: String,
    example: '0212876659',
  })
  @Expose({ groups: ['me', 'admin'] })
  dni?: string | null

  @Exclude({ toPlainOnly: true })
  password?: string

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Expose({ groups: ['me', 'admin'] })
  provider: string

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName: string | null

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName: string | null

  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null

  @ApiProperty({
    type: () => Role,
  })
  role?: Role | null

  @ApiProperty({
    type: () => Status,
  })
  status?: Status

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty()
  deletedAt: Date
}
