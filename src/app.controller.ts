import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<any> {
    return this.appService.getAllAssetData();
  }

  @Get('pool-token')
  getPoolTokenData(): Promise<any> {
    return this.appService.getPoolTokenData();
  }

  @Get('giza-arma-total-price')
  getGizaArmaTotalPrice(): Promise<any> {
    return this.appService.getGizaArmaTotalPrice();
  }

  @Get('fluid-preview-redeem')
  getFluidPreviewRedeem(): Promise<any> {
    return this.appService.getFluidPreviewRedeem();
  }

  @Get('wasabi-preview-redeem')
  getWasabiPreviewRedeem(): Promise<any> {
    return this.appService.getWasabiPreviewRedeem();
  }

  @Get('smokehouse-preview-redeem')
  getSmokehousePreviewRedeem(): Promise<any> {
    return this.appService.getSmokehousePreviewRedeem();
  }

  @Get('euler-preview-redeem')
  getEulerPreviewRedeem(): Promise<any> {
    return this.appService.getEulerPreviewRedeem();
  }

  @Get('susde-preview-redeem')
  getSUSDePreviewRedeem(): Promise<any> {
    return this.appService.getSUSDePreviewRedeem();
  }

  @Get('susds-chi')
  getSUSDSChi(): Promise<any> {
    return this.appService.getSUSDSChi();
  }
}
