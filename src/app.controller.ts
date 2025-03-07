import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<any> {
    return this.appService.getAllAssetData();
  }

  @Get('stkaed-usds')
  getStakedUSDeV2(): Promise<any> {
    return this.appService.getSTAKEDSKYUSDSBalance();
  }

  @Get('stusr')
  getSTUSR(): Promise<any> {
    return this.appService.getSTUSRBalance();
  }
}
