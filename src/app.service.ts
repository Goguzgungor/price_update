import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as puppeteer from 'puppeteer';
import { AETHUSDC, CASEWALLET, cUSDCv3, ERC20ABI, EULER, SMOKEHOUSEUSDC, StakedUSDeV2, STUSR, SUSDS, poolABI } from './contract.const';

@Injectable()
export class AppService {
  private provider: ethers.JsonRpcProvider;
  private baseProvider: ethers.JsonRpcProvider;
  private stakedUSDeV2Contract: ethers.Contract;
  private susdsContract: ethers.Contract;
  private aethUsdcContract: ethers.Contract;
  private cUSDCv3Contract : ethers.Contract;
  private stusrContract: ethers.Contract;
  private baseContract: ethers.Contract;
  private poolTokenContract: ethers.Contract;
  private fUSDCContract: ethers.Contract;
  public caseWalletAddress: string;
  private smokeHouseUSDCContract: ethers.Contract;
  private eulerContract: ethers.Contract;

  constructor() {
    // Initialize provider
    const apikey = "tCgmB6NQ4Qx7sYEWYZSAxOMBwN7F5TkH";
    this.provider = new ethers.JsonRpcProvider(
      `https://eth-mainnet.g.alchemy.com/v2/${apikey}`
    );

    // Initialize Base network provider
    this.baseProvider = new ethers.JsonRpcProvider('https://mainnet.base.org');

    // Initialize contracts
    this.eulerContract = new ethers.Contract(
      EULER.address,
      StakedUSDeV2.abi,
      this.provider
    );

    this.stakedUSDeV2Contract = new ethers.Contract(
      StakedUSDeV2.address,
      StakedUSDeV2.abi,
      this.provider
    );

    this.smokeHouseUSDCContract = new ethers.Contract(
      SMOKEHOUSEUSDC.address,
      StakedUSDeV2.abi,
      this.provider
    );

    this.fUSDCContract = new ethers.Contract(
      '0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33',
      StakedUSDeV2.abi,
      this.provider
    );

    this.cUSDCv3Contract = new ethers.Contract(
      cUSDCv3,
      ERC20ABI,
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

    // Initialize Base network contract
    this.baseContract = new ethers.Contract(
      '0x8cb85753524E8eebDA5Df1aE7bd5016BcD617357',
      SUSDS.abi, // Using SUSDS ABI since it has earned function
      this.baseProvider
    );

    // Initialize pool token contract
    this.poolTokenContract = new ethers.Contract(
      '0xe63296472be7fcb0160b1f65d12e1a7774ba1069',
      poolABI,
      this.baseProvider
    );

    this.caseWalletAddress = CASEWALLET;
  }

  async getStakedUSDeV2Balance() {
    const balance = await this.stakedUSDeV2Contract.balanceOf(this.caseWalletAddress);
    const totalPrice = await this.stakedUSDeV2Contract.convertToAssets(balance);
    return {balance:ethers.formatUnits(balance, 18), totalPrice: ethers.formatUnits(totalPrice, 18)}
  }

  async getSmokeHouseUSDCBalance() {
    const balance = await this.smokeHouseUSDCContract.balanceOf(this.caseWalletAddress);
    const totalPrice = await this.smokeHouseUSDCContract.convertToAssets(balance);
    return {balance:ethers.formatUnits(balance, 18), totalPrice: ethers.formatUnits(totalPrice, 6)}
  }

  async getEulerBalance() {
    const balance = await this.smokeHouseUSDCContract.balanceOf(this.caseWalletAddress);
    const totalPrice = await this.smokeHouseUSDCContract.convertToAssets(balance);
    return {balance:ethers.formatUnits(balance, 18), totalPrice: ethers.formatUnits(totalPrice, 6)}
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

  async getfUSDCBalance() {
    const balance = await this.fUSDCContract.balanceOf(this.caseWalletAddress);
    const totalPrice = await this.fUSDCContract.convertToAssets(balance);
    return {balance:ethers.formatUnits(balance, 18), totalPrice: ethers.formatUnits(totalPrice, 6)}
  }

  async getBaseContractEarned(userAddress: string) {
    const earned = await this.baseContract.earned(userAddress);
    return {earned: ethers.formatUnits(earned, 18)}
  }

  async getBaseContractData() {
    const balance = await this.baseContract.balanceOf(this.caseWalletAddress);
    const earned = await this.baseContract.earned(this.caseWalletAddress);
    return {
      balance: ethers.formatUnits(balance, 18),
      earned: ethers.formatUnits(earned, 18)
    }
  }

  async getPoolTokenData() {
    const balance = await this.baseContract.balanceOf(this.caseWalletAddress);
    const metadata = await this.poolTokenContract.metadata();
    const totalSupply = await this.poolTokenContract.totalSupply();
    
    // Use BigInt arithmetic to avoid precision loss
    const my_percentage = Number(balance * 10000n / totalSupply) / 100; // Calculate percentage with 2 decimal precision
    const my_balance_ytryb = balance * metadata[2] / totalSupply;
    const my_balance_usdc = balance * metadata[3] / totalSupply;
    const earned = await this.baseContract.earned(this.caseWalletAddress);
    
    // Convert scaling factors to actual decimal counts
    const dec0 = Math.log10(Number(metadata[0])); // 100000000 -> 8 decimals
    const dec1 = Math.log10(Number(metadata[1])); // 1000000 -> 6 decimals
    
    return {
      earnedAero: ethers.formatUnits(earned, 18),
      poolInfo: {
        my_percentage: my_percentage.toString() + "%",
        my_balance_ytryb: ethers.formatUnits(my_balance_ytryb, dec0),
        my_balance_usdc: ethers.formatUnits(my_balance_usdc, dec1),
        YTRYB: metadata[5],
        USDC: metadata[6]
      }
    }
  }

  async getGizaArmaTotalPrice() {
    let browser;
    try {
      const address = "0x95fe5432094735782200b348a389b36a77598a27";
      
      // Launch browser
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set a realistic user agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to DeBank profile
      console.log(`Navigating to DeBank profile: ${address}`);
      await page.goto(`https://debank.com/profile/${address}`, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      console.log('Page loaded, waiting for content to fully load...');
      
      // Wait for the main content to load
      try {
        await page.waitForSelector('.HeaderInfo_totalAssetInner__HyrdC', { timeout: 10000 });
        console.log('Found total asset element');
      } catch (e) {
        console.log('Total asset element not found, continuing anyway');
      }
      
      // Wait for loading indicators to disappear
      let retryCount = 0;
      const maxRetries = 10;
      
      while (retryCount < maxRetries) {
        // Check if page is still loading
        const isLoading = await page.evaluate(() => {
          const loadingElements = document.querySelectorAll('.db-loading, .db-loading-inner');
          const updatingText = document.querySelector('[class*="refresh"], [class*="updating"]');
          return loadingElements.length > 0 || (updatingText && updatingText.textContent?.includes('Updating'));
        });
        
        if (!isLoading) {
          console.log('Page finished loading');
          break;
        }
        
        console.log(`Page still loading, waiting... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retryCount++;
      }
      
      // Additional wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try to extract data using different strategies
      const scrapedData = await page.evaluate(() => {
        console.log('Starting data extraction...');
        
        // Strategy 1: Look for total portfolio value in HeaderInfo
        let totalValue = '';
        let foundMethod = '';
        
        // Check HeaderInfo_totalAssetInner first (most specific)
        const headerAssetElement = document.querySelector('.HeaderInfo_totalAssetInner__HyrdC');
        if (headerAssetElement) {
          const text = headerAssetElement.textContent?.trim() || '';
          console.log(`HeaderInfo element text: "${text}"`);
          if (text && text !== '$0' && text.includes('$')) {
            totalValue = text.split('$')[1]?.split(/[^0-9.,]/)[0];
            if (totalValue) {
              totalValue = '$' + totalValue;
              foundMethod = 'HeaderInfo_totalAssetInner';
            }
          } else if (text === '$0') {
            totalValue = '$0';
            foundMethod = 'HeaderInfo_totalAssetInner (confirmed $0)';
          }
        }
        
        // Strategy 2: Try other specific selectors if not found
        if (!totalValue) {
          const selectors = [
            '.HeaderInfo_totalAsset__dQnoy',
            '[class*="totalAsset"]',
            '[class*="TotalAsset"]', 
            '[class*="total-asset"]',
            '[class*="portfolio"]',
            '[class*="Portfolio"]'
          ];
          
          for (const selector of selectors) {
            try {
              const elements = document.querySelectorAll(selector);
              console.log(`Trying selector: ${selector}, found ${elements.length} elements`);
              
              for (const element of elements) {
                const text = element.textContent?.trim() || '';
                console.log(`Element text: "${text}"`);
                if (text.includes('$') && text.match(/\$[\d,]+/)) {
                  const match = text.match(/\$[\d,]+(?:\.\d{2})?/);
                  if (match && match[0] !== '$0') {
                    totalValue = match[0];
                    foundMethod = `CSS selector: ${selector}`;
                    console.log(`Found value with ${selector}: ${totalValue}`);
                    break;
                  }
                }
              }
              if (totalValue && totalValue !== '$0') break;
            } catch (e) {
              console.log(`Selector ${selector} failed:`, e.message);
            }
          }
        }
        
        // Strategy 3: Look for any significant dollar amounts on the page
        if (!totalValue || totalValue === '$0') {
          console.log('Trying regex strategy...');
          const allText = document.body.innerText;
          const dollarMatches = allText.match(/\$[\d,]+(?:\.\d{2})?/g);
          console.log(`Found ${dollarMatches?.length || 0} dollar amounts:`, dollarMatches);
          
          if (dollarMatches && dollarMatches.length > 0) {
            // Filter out $0 and find the largest meaningful amount
            const meaningfulAmounts = dollarMatches
              .filter(match => match !== '$0')
              .map(match => {
                const num = parseFloat(match.replace(/[$,]/g, ''));
                return { text: match, value: num };
              })
              .filter(item => item.value > 0)
              .sort((a, b) => b.value - a.value);
            
            if (meaningfulAmounts.length > 0) {
              totalValue = meaningfulAmounts[0].text;
              foundMethod = 'Regex extraction (largest meaningful amount)';
              console.log(`Found largest meaningful amount: ${totalValue}`);
            } else if (!totalValue) {
              totalValue = '$0';
              foundMethod = 'Default (no meaningful amounts found)';
            }
          }
        }
        
        // If still no value found, default to $0
        if (!totalValue) {
          totalValue = '$0';
          foundMethod = 'Default fallback';
        }
        
        return {
          totalValue: totalValue,
          foundMethod: foundMethod
        };
      });
      
      await browser.close();
      
      return scrapedData.totalValue;
      
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      console.error('DeBank scraping error:', error.message);
      return '$0';
    }
  }

  async getAllAssetData() {
    const stakedUSDeV2Balance = await this.getStakedUSDeV2Balance();
    const aethUsdcBalance = await this.getAETHUSDCBalance();
    const stakedUSRBalance = await this.getSTUSRBalance();
    const stakedSkyUsdsBalance = await this.getSTAKEDSKYUSDSBalance();
    const cusdcv3Balance = await this.getcUSDCv3Balance();
    const smokeHouseUSDCBalance = await this.getSmokeHouseUSDCBalance();
    const eulerBalance = await this.getEulerBalance();
    const poolTokenData = await this.getPoolTokenData();
    const fUSDCBalance = await this.getfUSDCBalance();
    const gizaArmaTotalPrice = await this.getGizaArmaTotalPrice();
    
    const result: any = {};
    
    // Add Giza Arma total price
    if (gizaArmaTotalPrice && gizaArmaTotalPrice !== '$0') {
      result.gizaArmaTotal = gizaArmaTotalPrice;
    }
    
    // Only include assets with non-zero balances
    if (parseFloat(stakedUSDeV2Balance.balance) > 0) {
      result.sUSDe = {quantity: stakedUSDeV2Balance.balance, totalPrice: stakedUSDeV2Balance.totalPrice};
    }
    
    if (parseFloat(aethUsdcBalance.balance) > 0) {
      result.aethUsdc = {quantity: aethUsdcBalance.balance};
    }
    
    if (parseFloat(stakedUSRBalance.balance) > 0) {
      result.stUSR = {quantity: stakedUSRBalance.balance};
    }
    
    if (parseFloat(stakedSkyUsdsBalance.balance) > 0 || parseFloat(stakedSkyUsdsBalance.earned) > 0) {
      result.stakedSkyUsds = {quantity: stakedSkyUsdsBalance.balance, earnedSKY: stakedSkyUsdsBalance.earned};
    }
    
    if (parseFloat(cusdcv3Balance.balance) > 0) {
      result.cusdcv3 = {quantity: cusdcv3Balance.balance};
    }
    
    if (parseFloat(smokeHouseUSDCBalance.balance) > 0) {
      result.smokeHouseUSDC = {quantity: smokeHouseUSDCBalance.balance, totalPrice: smokeHouseUSDCBalance.totalPrice};
    }
    
    if (parseFloat(eulerBalance.balance) > 0) {
      result.euler = {quantity: eulerBalance.balance, totalPrice: eulerBalance.totalPrice};
    }
    
    if (parseFloat(fUSDCBalance.balance) > 0) {
      result.fUSDC = {totalPrice: fUSDCBalance.totalPrice};
    }
    
    if (parseFloat(poolTokenData.earned) > 0 || parseFloat(poolTokenData.poolInfo.my_balance_ytryb) > 0 || parseFloat(poolTokenData.poolInfo.my_balance_usdc) > 0) {
      result.poolToken = {earned: poolTokenData.earned, poolInfo: poolTokenData.poolInfo};
    }
    
    return result;
  }
}
