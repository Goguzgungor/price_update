import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import axios from 'axios';

type ContractDef = {
  address: string;
  previewRedeemAbi?: any[];
  balanceOfAbi?: any[];
  chiAbi?: any[];
};

const CONTRACTS: Record<string, ContractDef> = {
  fluid: {
    address: '0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33',
    previewRedeemAbi: [{
      "inputs": [{ "internalType": "uint256", "name": "shares_", "type": "uint256" }],
      "name": "previewRedeem",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }],
    balanceOfAbi: [{
      "constant": true,
      "inputs": [{ "name": "account", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "", "type": "uint256" }],
      "type": "function"
    }]
  },
  wasabi: {
    address: '0x7d7bb40f523266b63319bc3e3f6f351b9e389e8f',
    previewRedeemAbi: [{
      "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
      "name": "previewRedeem",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }],
    balanceOfAbi: [{
      "constant": true,
      "inputs": [{ "name": "account", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "", "type": "uint256" }],
      "type": "function"
    }]
  },
  smokehouse: {
    address: '0xbeefff209270748ddd194831b3fa287a5386f5bc',
    previewRedeemAbi: [{
      "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
      "name": "previewRedeem",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }],
    balanceOfAbi: [{
      "constant": true,
      "inputs": [{ "name": "account", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "", "type": "uint256" }],
      "type": "function"
    }]
  },
  euler: {
    address: '0xe0a80d35bb6618cba260120b279d357978c42bce',
    previewRedeemAbi: [{
      "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
      "name": "previewRedeem",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }],
    balanceOfAbi: [{
      "constant": true,
      "inputs": [{ "name": "account", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "", "type": "uint256" }],
      "type": "function"
    }]
  },
  susde: {
    address: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
    previewRedeemAbi: [{
      "inputs": [{ "internalType": "uint256", "name": "shares", "type": "uint256" }],
      "name": "previewRedeem",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }],
    balanceOfAbi: [{
      "constant": true,
      "inputs": [{ "name": "account", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "", "type": "uint256" }],
      "type": "function"
    }]
  },
  susds: {
    address: '0xa3931d71877c0e7a3148cb7eb4463524fec27fbd',
    chiAbi: [{
      "inputs": [],
      "name": "chi",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }],
    balanceOfAbi: [{
      "constant": true,
      "inputs": [{ "name": "account", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "", "type": "uint256" }],
      "type": "function"
    }]
  }
};

const WALLET_ADDRESS = '0x8676AFd0251A8E69A93596F9D84D17F179e0BA7A';

@Injectable()
export class AppService {
  private provider: ethers.JsonRpcProvider;
  private coinMarketCapApiKey = "c25a77d0-8371-4a4a-8197-220831d2058f";

  constructor() {
    const apikey = "tCgmB6NQ4Qx7sYEWYZSAxOMBwN7F5TkH";
    this.provider = new ethers.JsonRpcProvider(
      `https://eth-mainnet.g.alchemy.com/v2/${apikey}`
    );
  }

  // --- Price API Functions ---
  async getAEROPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=AERO";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.AERO.quote.USD.price;
    } catch (error) { return null; }
  }
  async getEULPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=EUL";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.EUL.quote.USD.price;
    } catch (error) { return null; }
  }
  async getSENAPrice() {
    const cgId = "ethena-staked-ena";
    const dsAddress = "0x8be3460a480c80728a8c4d7a5d5303c85ba7b3b9";
    let price = null;
    try {
      const cmcUrl = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?slug=ethena-staked-ena";
      const cmcResp = await axios.get(cmcUrl, { headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey } });
      const idKey = Object.keys(cmcResp.data.data || {})[0];
      if (idKey) price = cmcResp.data.data[idKey].quote.USD.price;
    } catch (e) {}
    if (price === null) {
      try {
        const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`;
        const cgResp = await axios.get(cgUrl);
        if (cgResp.data && cgResp.data[cgId] && cgResp.data[cgId].usd !== undefined) price = cgResp.data[cgId].usd;
      } catch (e) {}
    }
    if (price === null) {
      try {
        const dsUrl = `https://api.dexscreener.com/latest/dex/tokens/${dsAddress}`;
        const dsResp = await axios.get(dsUrl);
        if (dsResp.data && dsResp.data.pairs && dsResp.data.pairs.length)
          price = Number(dsResp.data.pairs[0].priceUsd);
      } catch (e) {}
    }
    return price;
  }
  async getFluidPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=FLUID";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.FLUID.quote.USD.price;
    } catch (error) { return null; }
  }
  async getMorphoPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=MORPHO";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.MORPHO.quote.USD.price;
    } catch (error) { return null; }
  }
  async getCompPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=COMP";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.COMP.quote.USD.price;
    } catch (error) { return null; }
  }
  async getSKYPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SKY";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.SKY.quote.USD.price;
    } catch (error) { return null; }
  }

  // --- Contract Read Functions ---
  private formatNumber(value: string, contractKey?: string, isBalance: boolean = false): string {
    if (!value || value === '0') return '0';
    
    // Special formatting for wasabi and sUSDS balance only (4th digit)
    if (isBalance && contractKey && ['wasabi', 'susds'].includes(contractKey) && value.length >= 4) {
      return value.slice(0, 4) + '.' + value.slice(4);
    }
    
    // Default: Add decimal point after first digit from left
    if (value.length >= 1) {
      return value.slice(0, 1) + '.' + value.slice(1);
    }
    return value;
  }

  private async callPreviewRedeem(contractKey: keyof typeof CONTRACTS, shares: string | number) {
    const contractDef = CONTRACTS[contractKey];
    if (!contractDef.previewRedeemAbi) return null;
    const contract = new ethers.Contract(contractDef.address, contractDef.previewRedeemAbi, this.provider);
    try { 
      const result = (await contract.previewRedeem(shares)).toString();
      // Format for specific assets
      if (['fluid', 'wasabi', 'smokehouse', 'euler', 'susde', 'susds'].includes(contractKey)) {
        return this.formatNumber(result, contractKey, false); // false for price
      }
      return result;
    } catch { return null; }
  }
  private async callBalanceOf(contractKey: keyof typeof CONTRACTS) {
    const contractDef = CONTRACTS[contractKey];
    if (!contractDef.balanceOfAbi) return null;
    const contract = new ethers.Contract(contractDef.address, contractDef.balanceOfAbi, this.provider);
    try { 
      const result = (await contract.balanceOf(WALLET_ADDRESS)).toString();
      // Format for specific assets
      if (['fluid', 'wasabi', 'smokehouse', 'euler', 'susde', 'susds'].includes(contractKey)) {
        return this.formatNumber(result, contractKey, true); // true for balance
      }
      return result;
    } catch { return null; }
  }
  private async callChi() {
    const { address, chiAbi } = CONTRACTS.susds;
    const contract = new ethers.Contract(address, chiAbi, this.provider);
    try { 
      const result = (await contract.chi()).toString();
      return this.formatNumber(result, 'susds', false); // false for price
    } catch { return null; }
  }

  async getFluidPreviewRedeem() { return this.callPreviewRedeem('fluid', 1000000); }
  async getWasabiPreviewRedeem() { return this.callPreviewRedeem('wasabi', 1000000); }
  async getSmokehousePreviewRedeem() { return this.callPreviewRedeem('smokehouse', '1000000000000000000'); }
  async getEulerPreviewRedeem() { return this.callPreviewRedeem('euler', 1000000); }
  async getSUSDePreviewRedeem() { return this.callPreviewRedeem('susde', '1000000000000000000'); }
  async getSUSDSChi() { return this.callChi(); }

  async getFluidBalance() { return this.callBalanceOf('fluid'); }
  async getWasabiBalance() { return this.callBalanceOf('wasabi'); }
  async getSmokehouseBalance() { return this.callBalanceOf('smokehouse'); }
  async getEulerBalancePreview() { return this.callBalanceOf('euler'); }
  async getSUSDeBalancePreview() { return this.callBalanceOf('susde'); }
  async getSUSDSBalance() { return this.callBalanceOf('susds'); }


  // --- Wallet Balances (Etherscan/Basescan) ---
  async getWalletBalances() {
    const fundingAddress = '0x8676afd0251a8e69a93596f9d84d17f179e0ba7a';
    const daoAddress = '0x249fd2604B7650D71Bc42e7aEd23e69915f4Ed01';
    const ethUSDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const baseUSDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
    const etherscanKey = '2P6MGPR2MWZD9C9K8JWRJSU22XD5XMYV9G';
    const basescanKey = 'BPJR7AH7NI3G6EQQB7PFTKR49K1T8RV89X';
    const ethFundingUrl = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${ethUSDC}&address=${fundingAddress}&tag=latest&apikey=${etherscanKey}`;
    const baseFundingUrl = `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${baseUSDC}&address=${fundingAddress}&tag=latest&apikey=${basescanKey}`;
    const ethDaoUrl = `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${ethUSDC}&address=${daoAddress}&tag=latest&apikey=${etherscanKey}`;
    const baseDaoUrl = `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${baseUSDC}&address=${daoAddress}&tag=latest&apikey=${basescanKey}`;
    try {
      const [ethFundingRes, baseFundingRes, ethDaoRes, baseDaoRes] = await Promise.all([
        axios.get(ethFundingUrl),
        axios.get(baseFundingUrl),
        axios.get(ethDaoUrl),
        axios.get(baseDaoUrl)
      ]);
      const ethFunding = Number(ethFundingRes.data.result) / 1e6;
      const baseFunding = Number(baseFundingRes.data.result) / 1e6;
      const ethDao = Number(ethDaoRes.data.result) / 1e6;
      const baseDao = Number(baseDaoRes.data.result) / 1e6;
      return {
        funding: { ethereum: ethFunding, base: baseFunding },
        daoTreasury: { ethereum: ethDao, base: baseDao }
      };
    } catch (e) { return null; }
  }

 
  // --- Main Aggregator ---
  async getAllAssetData() {
    const [
      fluidPreviewRedeem,
      wasabiPreviewRedeem,
      smokehousePreviewRedeem,
      eulerPreviewRedeem,
      susdePreviewRedeem,
      susdsChi,
      aeroPrice,
      eulPrice,
      senaPrice,
      fluidPrice,
      morphoPrice,
      compPrice,
      skyPrice,
      fluidBalance,
      wasabiBalance,
      smokehouseBalance,
      eulerBalancePreview,
      susdeBalancePreview,
      susdsBalance,
      walletBalances
    ] = await Promise.all([
      this.getFluidPreviewRedeem(),
      this.getWasabiPreviewRedeem(),
      this.getSmokehousePreviewRedeem(),
      this.getEulerPreviewRedeem(),
      this.getSUSDePreviewRedeem(),
      this.getSUSDSChi(),
      this.getAEROPrice(),
      this.getEULPrice(),
      this.getSENAPrice(),
      this.getFluidPrice(),
      this.getMorphoPrice(),
      this.getCompPrice(),
      this.getSKYPrice(),
      this.getFluidBalance(),
      this.getWasabiBalance(),
      this.getSmokehouseBalance(),
      this.getEulerBalancePreview(),
      this.getSUSDeBalancePreview(),
      this.getSUSDSBalance(),
      this.getWalletBalances()
    ]);
    return {
      fluid: { balance: fluidBalance, price: fluidPreviewRedeem },
      wasabi: { balance: wasabiBalance, price: wasabiPreviewRedeem },
      smokehouse: { balance: smokehouseBalance, price: smokehousePreviewRedeem },
      euler: { balance: eulerBalancePreview, price: eulerPreviewRedeem },
      sUSDe: { balance: susdeBalancePreview, price: susdePreviewRedeem },
      sUSDS: { balance: susdsBalance, price: susdsChi },
      aeroPrice,
      eulPrice,
      senaPrice,
      fluidPrice,
      morphoPrice,
      compPrice,
      skyPrice,
      funding: walletBalances?.funding,
      DAOTreasury: walletBalances?.daoTreasury
    };
  }
}
