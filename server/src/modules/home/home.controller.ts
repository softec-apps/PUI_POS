import { ApiTags } from '@nestjs/swagger'
import { Controller, Get } from '@nestjs/common'
import { HomeService } from '@/modules/home/home.service'

@ApiTags('Home')
@Controller()
export class HomeController {
  constructor(private service: HomeService) {}

  @Get()
  appInfo() {
    return this.service.appInfo()
  }
}
