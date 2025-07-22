import { User } from '@/modules/users/domain/user'
import { ApiProperty } from '@nestjs/swagger'

export class LoginResponseDto {
  @ApiProperty()
  token: string

  @ApiProperty()
  refreshToken: string

  @ApiProperty()
  tokenExpires: number

  @ApiProperty({
    type: () => User,
  })
  user: User
}
