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
  private coinMarketCapApiKey = "c25a77d0-8371-4a4a-8197-220831d2058f";

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

  async getAEROPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=AERO";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.AERO.quote.USD.price;
    } catch (error) {
      return null;
    }
  }

  async getEULPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=EUL";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.EUL.quote.USD.price;
    } catch (error) {
      return null;
    }
  }

  async getSENAPrice() {
    const cgId = "ethena-staked-ena";
    const dsAddress = "0x8be3460a480c80728a8c4d7a5d5303c85ba7b3b9";
    let price = null;
    // 1) CoinMarketCap
    try {
      const cmcUrl = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?slug=ethena-staked-ena";
      const cmcResp = await axios.get(cmcUrl, { headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey } });
      const idKey = Object.keys(cmcResp.data.data || {})[0];
      if (idKey) price = cmcResp.data.data[idKey].quote.USD.price;
    } catch (e) {}
    // 2) CoinGecko (yedek)
    if (price === null) {
      try {
        const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`;
        const cgResp = await axios.get(cgUrl);
        if (cgResp.data && cgResp.data[cgId] && cgResp.data[cgId].usd !== undefined) price = cgResp.data[cgId].usd;
      } catch (e) {}
    }
    // 3) DexScreener (son çare)
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
    } catch (error) {
      return null;
    }
  }

  async getFluidPreviewRedeem() {
    // FLUID contract address
    const fluidAddress = '0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33';
    // previewRedeem(uint256 shares_) view returns (uint256)
    const abi = [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "shares_",
            "type": "uint256"
          }
        ],
        "name": "previewRedeem",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    const contract = new ethers.Contract(fluidAddress, abi, this.provider);
    try {
      // 1000000 gönderiyoruz
      const result = await contract.previewRedeem(1000000);
      return result.toString();
    } catch (e) {
      return null;
    }
  }

  async getMorphoPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=MORPHO";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.MORPHO.quote.USD.price;
    } catch (error) {
      return null;
    }
  }

  async getCompPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=COMP";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.COMP.quote.USD.price;
    } catch (error) {
      return null;
    }
  }

  async getSKYPrice() {
    try {
      const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=SKY";
      const response = await axios.get(url, {
        headers: { "X-CMC_PRO_API_KEY": this.coinMarketCapApiKey }
      });
      return response.data.data.SKY.quote.USD.price;
    } catch (error) {
      return null;
    }
  }

  async getAccumulatedRewards() {
    try {
      const url = "https://app.euler.finance/api/v1/rewards/merkl/user?chainId=1&address=0x8676AFd0251A8E69A93596F9D84D17F179e0BA7A";
      const response = await axios.get(url);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const item = response.data.find((item: any) => item.accumulated !== undefined);
        if (item) return item.accumulated / 10 ** 18;
      }
      return null;
    } catch (error) {
      return null;
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
    const aeroPrice = await this.getAEROPrice();
    const eulPrice = await this.getEULPrice();
    const senaPrice = await this.getSENAPrice();
    const fluidPrice = await this.getFluidPrice();
    const morphoPrice = await this.getMorphoPrice();
    const compPrice = await this.getCompPrice();
    const skyPrice = await this.getSKYPrice();
    const accumulatedRewards = await this.getAccumulatedRewards();
    
    const result: any = {};
    
    // Add Giza Arma total price
    result.gizaArmaTotal = gizaArmaTotalPrice;
    
    // Include all assets regardless of balance
    result.sUSDe = {quantity: stakedUSDeV2Balance.balance, totalPrice: stakedUSDeV2Balance.totalPrice};
    result.aethUsdc = {quantity: aethUsdcBalance.balance};
    result.stUSR = {quantity: stakedUSRBalance.balance};
    result.stakedSkyUsds = {quantity: stakedSkyUsdsBalance.balance, earnedSKY: stakedSkyUsdsBalance.earned};
    result.cusdcv3 = {quantity: cusdcv3Balance.balance};
    result.smokeHouseUSDC = {quantity: smokeHouseUSDCBalance.balance, totalPrice: smokeHouseUSDCBalance.totalPrice};
    result.euler = {quantity: eulerBalance.balance, totalPrice: eulerBalance.totalPrice};
    result.fUSDC = {totalPrice: fUSDCBalance.totalPrice};
    result.poolToken = {earnedAero: poolTokenData.earnedAero, poolInfo: poolTokenData.poolInfo};
    result.aeroPrice = aeroPrice;
    result.eulPrice = eulPrice;
    result.senaPrice = senaPrice;
    result.fluidPrice = fluidPrice;
    result.morphoPrice = morphoPrice;
    result.compPrice = compPrice;
    result.skyPrice = skyPrice;
    result.accumulatedRewards = accumulatedRewards;
    
    return result;
  }

  async getWasabiPreviewRedeem() {
    // Wasabi Spicy Vault USDC contract address
    const wasabiAddress = '0x7d7bb40f523266b63319bc3e3f6f351b9e389e8f';
    // previewRedeem(uint256 shares) view returns (uint256)
    const abi = [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "shares",
            "type": "uint256"
          }
        ],
        "name": "previewRedeem",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    const contract = new ethers.Contract(wasabiAddress, abi, this.provider);
    try {
      // 1000000 gönderiyoruz
      const result = await contract.previewRedeem(1000000);
      return result.toString();
    } catch (e) {
      return null;
    }
  }

  async getSmokehousePreviewRedeem() {
    // Smokehouse BBQ USDC contract address
    const smokehouseAddress = '0xbeefff209270748ddd194831b3fa287a5386f5bc';
    // previewRedeem(uint256 shares) view returns (uint256)
    const abi = [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "shares",
            "type": "uint256"
          }
        ],
        "name": "previewRedeem",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    const contract = new ethers.Contract(smokehouseAddress, abi, this.provider);
    try {
      // 1000000000000000000 gönderiyoruz
      const result = await contract.previewRedeem('1000000000000000000');
      return result.toString();
    } catch (e) {
      return null;
    }
  }

  async getEulerPreviewRedeem() {
    // Euler ERC20 contract address
    const eulerAddress = '0xe0a80d35bb6618cba260120b279d357978c42bce';
    // previewRedeem(uint256 shares) view returns (uint256)
    const abi = [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "shares",
            "type": "uint256"
          }
        ],
        "name": "previewRedeem",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    const contract = new ethers.Contract(eulerAddress, abi, this.provider);
    try {
      // 1000000 gönderiyoruz
      const result = await contract.previewRedeem(1000000);
      return result.toString();
    } catch (e) {
      return null;
    }
  }

  async getSUSDePreviewRedeem() {
    // sUSDe ERC20 contract address
    const susdeAddress = '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497';
    // previewRedeem(uint256 shares) view returns (uint256)
    const abi = [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "shares",
            "type": "uint256"
          }
        ],
        "name": "previewRedeem",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    const contract = new ethers.Contract(susdeAddress, abi, this.provider);
    try {
      // 1000000000000000000 gönderiyoruz
      const result = await contract.previewRedeem('1000000000000000000');
      return result.toString();
    } catch (e) {
      return null;
    }
  }

  async getSUSDSChi() {
    // sUSDS ERC20 contract address
    const susdsAddress = '0xa3931d71877c0e7a3148cb7eb4463524fec27fbd';
    // chi() view returns (uint256)
    const abi = [
      {
        "inputs": [],
        "name": "chi",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    const contract = new ethers.Contract(susdsAddress, abi, this.provider);
    try {
      const result = await contract.chi();
      return result.toString();
    } catch (e) {
      return null;
    }
  }
}
