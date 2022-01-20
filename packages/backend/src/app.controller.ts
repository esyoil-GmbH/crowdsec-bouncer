import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { RealIP } from 'nestjs-real-ip';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('info')
  @SkipThrottle()
  getHello(@RealIP() ip: string): Promise<any> {
    return this.appService.getReason(ip);
  }

  @Get('unban-me')
  unbanMe(@RealIP() ip: string): Promise<any> {
    return this.appService.unbanMe(ip);
  }
}
