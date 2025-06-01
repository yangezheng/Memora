#!/usr/bin/env node

/**
 * Blockscout NFT API Test Script
 * 
 * This script tests the Blockscout API to list all NFTs owned by an account.
 * Supports multiple networks and provides detailed NFT information.
 */

const fetch = require('node-fetch');

// Blockscout API Configuration
const BLOCKSCOUT_CONFIG = {
  // Available Blockscout networks
  networks: {
    ethereum: 'https://eth.blockscout.com/api',
    sepolia: 'https://eth-sepolia.blockscout.com/api',
    polygon: 'https://polygon.blockscout.com/api',
    gnosis: 'https://gnosis.blockscout.com/api',
    optimism: 'https://optimism.blockscout.com/api',
    arbitrum: 'https://arbitrum.blockscout.com/api',
    base: 'https://base.blockscout.com/api',
    scroll: 'https://scroll.blockscout.com/api',
    mantle: 'https://mantle.blockscout.com/api',
    blast: 'https://blast.blockscout.com/api',
    linea: 'https://linea.blockscout.com/api'
  },
  
  // Default configuration
  defaultNetwork: 'ethereum',
  defaultAccount: '0x742E79B1Fd0E2C1473b83d3F4d16c8c7E7F8e4A9', // Sample account
  timeout: 10000 // 10 seconds
};

// Test account (you can change this)
const TEST_CONFIG = {
  network: process.env.BLOCKSCOUT_NETWORK || 'ethereum',
  account: process.env.TEST_ACCOUNT || '0x742E79B1Fd0E2C1473b83d3F4d16c8c7E7F8e4A9',
  maxResults: 50 // Limit results for testing
};

class BlockscoutNFTTester {
  constructor(network, account) {
    this.network = network;
    this.account = account;
    this.apiBase = BLOCKSCOUT_CONFIG.networks[network];
    
    if (!this.apiBase) {
      throw new Error(`Unsupported network: ${network}. Available: ${Object.keys(BLOCKSCOUT_CONFIG.networks).join(', ')}`);
    }
  }

  /**
   * Fetch NFT tokens for an account
   */
  async fetchNFTs() {
    try {
      console.log(`🔍 Fetching NFTs for account: ${this.account}`);
      console.log(`🌐 Network: ${this.network} (${this.apiBase})`);
      
      const url = `${this.apiBase}/v2/addresses/${this.account}/nft`;
      const params = new URLSearchParams({
        type: 'ERC-721,ERC-1155', // Both NFT standards
        limit: TEST_CONFIG.maxResults.toString()
      });

      console.log(`📡 API Request: ${url}?${params.toString()}`);
      
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Memora-NFT-Tester/1.0'
        },
        timeout: BLOCKSCOUT_CONFIG.timeout
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ NFT fetch error:', error.message);
      throw error;
    }
  }

  /**
   * Fetch detailed information for a specific NFT
   */
  async fetchNFTDetails(contractAddress, tokenId) {
    try {
      const url = `${this.apiBase}/v2/tokens/${contractAddress}/instances/${tokenId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Memora-NFT-Tester/1.0'
        },
        timeout: BLOCKSCOUT_CONFIG.timeout
      });

      if (!response.ok) {
        return null; // Silently fail for details
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return null; // Silently fail for details
    }
  }

  /**
   * Parse and format NFT data
   */
  formatNFTData(nftData) {
    if (!nftData || !nftData.items) {
      return {
        total: 0,
        nfts: [],
        summary: 'No NFTs found'
      };
    }

    const nfts = nftData.items.map(item => ({
      contract: item.token?.address || 'Unknown',
      contractName: item.token?.name || 'Unknown Collection',
      symbol: item.token?.symbol || 'N/A',
      tokenId: item.id || 'Unknown',
      tokenType: item.token?.type || 'Unknown',
      value: item.value || '1',
      metadata: {
        name: item.metadata?.name || `Token #${item.id}`,
        description: item.metadata?.description || 'No description',
        image: item.metadata?.image || item.metadata?.image_url || null,
        attributes: item.metadata?.attributes || []
      }
    }));

    // Group by contract
    const contracts = {};
    nfts.forEach(nft => {
      if (!contracts[nft.contract]) {
        contracts[nft.contract] = {
          name: nft.contractName,
          symbol: nft.symbol,
          type: nft.tokenType,
          count: 0,
          tokens: []
        };
      }
      contracts[nft.contract].count++;
      contracts[nft.contract].tokens.push(nft);
    });

    return {
      total: nfts.length,
      totalContracts: Object.keys(contracts).length,
      nfts,
      contracts,
      summary: `Found ${nfts.length} NFTs across ${Object.keys(contracts).length} collections`
    };
  }

  /**
   * Display formatted results
   */
  displayResults(formattedData) {
    console.log('\n🎨 NFT Collection Results:');
    console.log('═'.repeat(60));
    
    if (formattedData.total === 0) {
      console.log('😞 No NFTs found for this account');
      return;
    }

    console.log(`📊 Summary: ${formattedData.summary}`);
    console.log(`👤 Account: ${this.account}`);
    console.log(`🌐 Network: ${this.network}\n`);

    // Display by collection
    Object.entries(formattedData.contracts).forEach(([address, collection]) => {
      console.log(`📁 Collection: ${collection.name} (${collection.symbol})`);
      console.log(`   Contract: ${address}`);
      console.log(`   Type: ${collection.type}`);
      console.log(`   Owned: ${collection.count} token(s)`);
      
      // Show first few tokens
      const showCount = Math.min(3, collection.tokens.length);
      collection.tokens.slice(0, showCount).forEach(token => {
        console.log(`   🎨 ${token.metadata.name} (ID: ${token.tokenId})`);
        if (token.metadata.description && token.metadata.description !== 'No description') {
          console.log(`      📝 ${token.metadata.description.substring(0, 100)}${token.metadata.description.length > 100 ? '...' : ''}`);
        }
        if (token.metadata.image) {
          console.log(`      🖼️  ${token.metadata.image}`);
        }
      });
      
      if (collection.tokens.length > showCount) {
        console.log(`   ... and ${collection.tokens.length - showCount} more tokens`);
      }
      console.log('');
    });

    // Show overall stats
    console.log('📈 Statistics:');
    console.log(`   Total NFTs: ${formattedData.total}`);
    console.log(`   Collections: ${formattedData.totalContracts}`);
    
    const typeStats = {};
    formattedData.nfts.forEach(nft => {
      typeStats[nft.tokenType] = (typeStats[nft.tokenType] || 0) + 1;
    });
    
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} tokens`);
    });
  }

  /**
   * Save results to JSON file
   */
  saveResults(formattedData) {
    const fs = require('fs');
    const filename = `nft-results-${this.network}-${Date.now()}.json`;
    
    const output = {
      timestamp: new Date().toISOString(),
      network: this.network,
      account: this.account,
      apiBase: this.apiBase,
      results: formattedData
    };
    
    fs.writeFileSync(filename, JSON.stringify(output, null, 2));
    console.log(`💾 Results saved to: ${filename}`);
    
    return filename;
  }
}

/**
 * Test multiple accounts
 */
async function testMultipleAccounts(network, accounts) {
  console.log(`🔄 Testing ${accounts.length} accounts on ${network}...\n`);
  
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 Test ${i + 1}/${accounts.length}: ${account}`);
    console.log('='.repeat(80));
    
    try {
      const tester = new BlockscoutNFTTester(network, account);
      const rawData = await tester.fetchNFTs();
      const formattedData = tester.formatNFTData(rawData);
      tester.displayResults(formattedData);
      
      if (formattedData.total > 0) {
        tester.saveResults(formattedData);
      }
      
    } catch (error) {
      console.error(`❌ Test failed for ${account}:`, error.message);
    }
    
    // Rate limiting delay
    if (i < accounts.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Main test function
 */
async function main() {
  try {
    console.log('🚀 Blockscout NFT API Tester\n');
    
    // Show available networks
    console.log('🌐 Available Networks:');
    Object.keys(BLOCKSCOUT_CONFIG.networks).forEach(network => {
      console.log(`   - ${network}: ${BLOCKSCOUT_CONFIG.networks[network]}`);
    });
    console.log('');
    
    // Test accounts (you can modify these)
    const testAccounts = [
      TEST_CONFIG.account,
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
      '0x50DE6856358Cc35f3A9a57eAAA34BD4cB707d2cd'  // Another test address
    ];
    
    console.log('🎯 Test Configuration:');
    console.log(`   Network: ${TEST_CONFIG.network}`);
    console.log(`   Max Results: ${TEST_CONFIG.maxResults}`);
    console.log(`   Test Accounts: ${testAccounts.length}`);
    console.log('');
    
    // Run tests
    await testMultipleAccounts(TEST_CONFIG.network, testAccounts);
    
    console.log('\n🎊 Testing completed!');
    console.log('\n💡 Tips:');
    console.log('   - Set BLOCKSCOUT_NETWORK=polygon to test other networks');
    console.log('   - Set TEST_ACCOUNT=0x... to test specific accounts');
    console.log('   - Check generated JSON files for detailed data');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Network connectivity test
async function testConnectivity() {
  console.log('🔌 Testing network connectivity...\n');
  
  for (const [network, apiBase] of Object.entries(BLOCKSCOUT_CONFIG.networks)) {
    try {
      const response = await fetch(`${apiBase}/v2/stats`, { 
        method: 'GET',
        timeout: 5000 
      });
      
      const status = response.ok ? '✅' : '❌';
      console.log(`${status} ${network.padEnd(12)} - ${apiBase}`);
      
    } catch (error) {
      console.log(`❌ ${network.padEnd(12)} - ${error.message}`);
    }
  }
  console.log('');
}

// Command line argument handling
const args = process.argv.slice(2);
if (args.includes('--connectivity')) {
  testConnectivity().then(() => process.exit(0));
} else if (args.includes('--help')) {
  console.log(`
Blockscout NFT API Tester

Usage:
  node blockscout-nft-test.js                    # Run NFT tests
  node blockscout-nft-test.js --connectivity     # Test API connectivity
  node blockscout-nft-test.js --help            # Show this help

Environment Variables:
  BLOCKSCOUT_NETWORK=ethereum|polygon|...        # Select network
  TEST_ACCOUNT=0x...                            # Test specific account

Examples:
  BLOCKSCOUT_NETWORK=polygon npm run test
  TEST_ACCOUNT=0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 node blockscout-nft-test.js
`);
  process.exit(0);
} else {
  main().catch(console.error);
}

module.exports = { BlockscoutNFTTester }; 