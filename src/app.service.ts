import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { AETHUSDC, CASEWALLET, cUSDCv3, ERC20ABI, StakedUSDeV2, STUSR, SUSDS } from './contract.const';

@Injectable()
export class AppService {
  private provider: ethers.JsonRpcProvider;
  private stakedUSDeV2Contract: ethers.Contract;
  private susdsContract: ethers.Contract;
  private aethUsdcContract: ethers.Contract;
  private cUSDCv3Contract : ethers.Contract;
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

    this.cUSDCv3Contract = new ethers.Contract(
      cUSDCv3,
      ERC20ABI,
      this.provider
    )

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
    const totalPrice = await this.stakedUSDeV2Contract.convertToAssets(balance);
    return {balance:ethers.formatUnits(balance, 18), totalPrice: ethers.formatUnits(totalPrice, 18)}
  }

  async getSTAKEDSKYUSDSBalance() {
    const balance = await this.susdsContract.balanceOf(this.caseWalletAddress);
    const earned = await this.susdsContract.earned(this.caseWalletAddress);
    return {balance:ethers.formatUnits(balance, 18), earned: ethers.formatUnits(earned, 18)}
  }

  async getcUSDCv3Balance(){
    const balance = await this.cUSDCv3Contract.balanceOf(this.caseWalletAddress);
    return {balance:ethers.formatUnits(balance, 6)}
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
    const aethUsdcBalance = await this.getAETHUSDCBalance();
    const stakedUSRBalance = await this.getSTUSRBalance();
    const stakedSkyUsdsBalance = await this.getSTAKEDSKYUSDSBalance();
    const cusdcv3Balance = await this.getcUSDCv3Balance();
    return {sUSDe : {quantity: stakedUSDeV2Balance.balance, totalPrice: stakedUSDeV2Balance.totalPrice},
     aethUsdc : {quantity: aethUsdcBalance.balance},
     stUSR : {quantity: stakedUSRBalance.balance},
     stakedSkyUsds : {quantity: stakedSkyUsdsBalance.balance, earnedSKY: stakedSkyUsdsBalance.earned},
     cusdcv3 : {quantity: cusdcv3Balance.balance}}
  }




}
