import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { AETHUSDC, CASEWALLET, StakedUSDeV2, STUSR, SUSDS } from './contract.const';

@Injectable()
export class AppService {
  private provider: ethers.JsonRpcProvider;
  private stakedUSDeV2Contract: ethers.Contract;
  private susdsContract: ethers.Contract;
  private aethUsdcContract: ethers.Contract;
  private stusrContract: ethers.Contract;
  public caseWalletAddress: string;

  constructor() {
    // Initialize provider
    const apikey = "tCgmB6NQ4Qx7sYEWYZSAxOMBwN7F5TkH";
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

    this.stusrContract = new ethers.Contract(
      STUSR.address,
      STUSR.abi,
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

  async getSTAKEDSKYUSDSBalance() {
    const balance = await this.susdsContract.balanceOf(this.caseWalletAddress);
    const earned = await this.susdsContract.earned(this.caseWalletAddress);
    return {balance:ethers.formatUnits(balance, 18), earned: ethers.formatUnits(earned, 18),totalBalance: ethers.formatUnits(balance + earned, 18)}
  }


  async getAETHUSDCBalance() {
    const balance = await this.aethUsdcContract.balanceOf(this.caseWalletAddress);
    return {balance:ethers.formatUnits(balance, 6), totalPrice: ethers.formatUnits(balance, 6)}
  }

  async getSTUSRBalance() {
    const balance = await this.stusrContract.balanceOf(this.caseWalletAddress);
    return {balance:ethers.formatUnits(balance, 18)}
  }

  async getAllAssetData() {
    const stakedUSDeV2Balance = await this.getStakedUSDeV2Balance();
    const susdsBalance = await this.getSUSDSBalance();
    const aethUsdcBalance = await this.getAETHUSDCBalance();
    return {stakedUSDeV2Balance, susdsBalance, aethUsdcBalance}
  }




}
