// Blockscout API service for Ethereum Sepolia
const BLOCKSCOUT_API_BASE = process.env.NEXT_PUBLIC_BLOCKSCOUT_API_BASE || 'https://eth-sepolia.blockscout.com/api/v2'
const BLOCKSCOUT_EXPLORER = process.env.NEXT_PUBLIC_BLOCKSCOUT_EXPLORER || 'https://eth-sepolia.blockscout.com'

export interface NFTToken {
  token: {
    address: string
    name: string
    symbol: string
    type: string
  }
  token_id: string
  value: string
  owner: {
    hash: string
  }
  metadata?: {
    name?: string
    description?: string
    image?: string
    animation_url?: string
    attributes?: Array<{
      trait_type: string
      value: string
    }>
  }
  tx_hash?: string
}

export interface BlockscoutTransaction {
  hash: string
  block: number
  timestamp: string
  from: {
    hash: string
  }
  to: {
    hash: string
  }
  value: string
  status: string
  method: string
  gas_used: string
  gas_limit: string
}

// Fetch NFT instances for a specific token contract
export async function fetchNFTInstances(contractAddress: string): Promise<NFTToken[]> {
  try {
    console.log(`🔍 Fetching NFT instances from: ${BLOCKSCOUT_API_BASE}/tokens/${contractAddress}/instances`)
    
    const response = await fetch(`${BLOCKSCOUT_API_BASE}/tokens/${contractAddress}/instances`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.warn(`⚠️ API returned ${response.status}: ${response.statusText}`)
      
      // If it's a 404, the contract probably doesn't exist or has no instances
      if (response.status === 404) {
        console.log('📝 No NFT instances found for this contract address')
        return []
      }
      
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`✅ Found ${data.items?.length || 0} NFT instances`)
    return data.items || []
  } catch (error) {
    console.error('❌ Error fetching NFT instances:', error)
    return []
  }
}

// Fetch transactions for a specific address
export async function fetchAddressTransactions(address: string, limit: number = 50): Promise<BlockscoutTransaction[]> {
  try {
    const response = await fetch(`${BLOCKSCOUT_API_BASE}/addresses/${address}/transactions?limit=${limit}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error fetching address transactions:', error)
    return []
  }
}

// Fetch transaction details
export async function fetchTransactionDetails(txHash: string): Promise<BlockscoutTransaction | null> {
  try {
    const response = await fetch(`${BLOCKSCOUT_API_BASE}/transactions/${txHash}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching transaction details:', error)
    return null
  }
}

// Convert NFT instance to Memory format
export function convertNFTToMemory(nft: NFTToken): {
  id: string
  name: string
  description: string
  location: string
  emotion: string
  cid: string
  txHash: string
  owner: string
  createdAt: string
  likes: number
  views: number
  thumbnail: string
  lumaUrl?: string
} {
  // Extract metadata or use fallbacks
  const metadata = nft.metadata || {}
  const attributes = metadata.attributes || []
  
  // Find specific attributes
  const location = attributes.find(attr => attr.trait_type.toLowerCase() === 'location')?.value || 'Unknown Location'
  const emotion = attributes.find(attr => attr.trait_type.toLowerCase() === 'emotion')?.value || 'Nostalgic'
  
  // Extract IPFS CID from metadata or animation_url
  let cid = 'QmDefault'
  if (metadata.animation_url) {
    const ipfsMatch = metadata.animation_url.match(/(?:ipfs:\/\/|\/ipfs\/)([a-zA-Z0-9]+)/)
    if (ipfsMatch) {
      cid = ipfsMatch[1]
    }
  }

  // Create a more realistic timestamp from token ID or use current date
  const createdAt = new Date(Date.now() - parseInt(nft.token_id) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return {
    id: nft.token_id,
    name: metadata.name || `Memory #${nft.token_id}`,
    description: metadata.description || 'A cherished memory captured in 3D.',
    location,
    emotion,
    cid,
    txHash: nft.tx_hash || '0x0',
    owner: nft.owner.hash,
    createdAt,
    likes: Math.floor(Math.random() * 100), // Random for demo
    views: Math.floor(Math.random() * 500), // Random for demo
    thumbnail: metadata.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    lumaUrl: metadata.animation_url || 'https://lumalabs.ai/capture/089bc8d0-23e0-4ef7-8a72-d028d0dd86ab'
  }
}

// Get Blockscout explorer URL for any path
export function getBlockscoutURL(path: string): string {
  return `${BLOCKSCOUT_EXPLORER}/${path}`
}

// Format address for display
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Get supported chain ID for Blockscout SDK
export function getChainId(): string {
  return process.env.NEXT_PUBLIC_SEPOLIA_CHAIN_ID || '11155111'
}

// Check if an address looks like a valid contract address (not a user address)
export function isValidContractAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address) && address !== '0x0000000000000000000000000000000000000000'
} 