import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HomeService } from '@/modules/home/home.service'
import { HomeController } from '@/modules/home/home.controller'

@Module({
  imports: [ConfigModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
