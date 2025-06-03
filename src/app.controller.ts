import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<any> {
    return this.appService.getAllAssetData();
  }

  @Get('staked-usds')
  getStakedUSDeV2(): Promise<any> {
    return this.appService.getSTAKEDSKYUSDSBalance();
  }

  @Get('stusr')
  getSTUSR(): Promise<any> {
    return this.appService.getSTUSRBalance();
  }

  @Get('fusdc')
  getfUSDC(): Promise<any> {
    return this.appService.getfUSDCBalance();
  }

  @Get('base-contract')
  getBaseContractData(): Promise<any> {
    return this.appService.getBaseContractData();
  }

  @Get('pool-token')
  getPoolTokenData(): Promise<any> {
    return this.appService.getPoolTokenData();
  }

  @Get('giza-arma-total-price')
  getGizaArmaTotalPrice(): Promise<any> {
    return this.appService.getGizaArmaTotalPrice();
  }
}
