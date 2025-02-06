import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { AETHUSDC, CASEWALLET, StakedUSDeV2, SUSDS } from './contract.const';

@Injectable()
export class AppService {
  private provider: ethers.JsonRpcProvider;
  private stakedUSDeV2Contract: ethers.Contract;
  private susdsContract: ethers.Contract;
  private aethUsdcContract: ethers.Contract;
  public caseWalletAddress: string;

  constructor() {
    // Initialize provider
    const apikey = "your-api-key";
    this.provider = new ethers.JsonRpcProvider(
      `https://eth-mainnet.g.alchemy.com/v2/${apikey}`
    );

    // Initialize contracts
    this.stakedUSDeV2Contract = new ethers.Contract(
      StakedUSDeV2.address,
      StakedUSDeV2.abi,
      this.provider
    );

    this.susdsContract = new ethers.Contract(
      SUSDS.address,
      SUSDS.abi,
      this.provider
    );

    this.aethUsdcContract = new ethers.Contract(
      AETHUSDC.address,
      AETHUSDC.abi,
      this.provider
    );

    this.caseWalletAddress = CASEWALLET;
  }

  async getStakedUSDeV2Balance() {
    const balance = await this.stakedUSDeV2Contract.balanceOf(this.caseWalletAddress);
    const totalPrice = await this.stakedUSDeV2Contract.previewRedeem(balance);
    return {balance:ethers.formatUnits(balance, 18), totalPrice: ethers.formatUnits(totalPrice, 18)}
  }

  async getSUSDSBalance() {
    const balance = await this.susdsContract.balanceOf(this.caseWalletAddress);
    const totalPrice = await this.susdsContract.previewRedeem(balance);
    return {balance:ethers.formatUnits(balance, 18), totalPrice: ethers.formatUnits(totalPrice, 18)}
  }

  async getAETHUSDCBalance() {
    const balance = await this.aethUsdcContract.balanceOf(this.caseWalletAddress);
    return {balance:ethers.formatUnits(balance, 6), totalPrice: ethers.formatUnits(balance, 6)}
  }

  async getAllAssetData() {
    const stakedUSDeV2Balance = await this.getStakedUSDeV2Balance();
    const susdsBalance = await this.getSUSDSBalance();
    const aethUsdcBalance = await this.getAETHUSDCBalance();
    return {stakedUSDeV2Balance, susdsBalance, aethUsdcBalance}
  }

}
