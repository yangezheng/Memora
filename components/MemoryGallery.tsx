'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Eye, Heart, ExternalLink, Filter, Search, Grid, List, Lock, Crown, History, Loader } from 'lucide-react'
import { useNotification, useTransactionPopup } from '@blockscout/app-sdk'
import LumaSplatsViewer from './LumaSplatsViewer'
import { ethers } from 'ethers'
import { fetchNFTInstances, convertNFTToMemory, getBlockscoutURL, formatAddress as formatAddr, getChainId } from '../lib/blockscout'
import { toast } from 'react-hot-toast'

interface Memory {
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
  lumaUrl?: string // Luma capture URL for 3D viewing
}

// Example NFT contract address - replace with actual Memora contract address
const MEMORA_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MEMORA_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890'

const SAMPLE_MEMORIES: Memory[] = [
  {
    id: '1',
    name: 'Sunset at Zion National Park',
    description: 'An incredible hiking experience with breathtaking views. The golden hour light was absolutely magical.',
    location: 'Zion National Park',
    emotion: 'Inspired',
    cid: 'QmYx5rJsHFQrWALQsGNHaKqFLR3EXRzM3Mj8A9zQeWvXyZ',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    owner: 'USER_WALLET', // This will be replaced with connected wallet for demo
    createdAt: '2024-01-15',
    likes: 42,
    views: 156,
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    lumaUrl: 'https://lumalabs.ai/capture/089bc8d0-23e0-4ef7-8a72-d028d0dd86ab'
  },
  {
    id: '2',
    name: 'Beach Day Memories',
    description: 'Perfect day at the beach with friends. The waves were perfect and the sunset was unforgettable.',
    location: 'Malibu Beach',
    emotion: 'Happy',
    cid: 'QmAbc123HFQrWALQsGNHaKqFLR3EXRzM3Mj8A9zQeWvXyZ',
    txHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    owner: '0x852d35Cc4000000000000000000000000000000',
    createdAt: '2024-01-10',
    likes: 28,
    views: 89,
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop',
    lumaUrl: 'https://lumalabs.ai/capture/ca9ea966-ca24-4ec1-ab0f-af665cb546ff'
  },
  {
    id: '3',
    name: 'Mountain Peak Adventure',
    description: 'Reached the summit after a challenging climb. The view from the top was worth every step.',
    location: 'Mount Whitney',
    emotion: 'Adventurous',
    cid: 'QmDef789HFQrWALQsGNHaKqFLR3EXRzM3Mj8A9zQeWvXyZ',
    txHash: '0x789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456',
    owner: '0x962d35Cc4000000000000000000000000000000',
    createdAt: '2024-01-05',
    likes: 67,
    views: 234,
    thumbnail: 'https://images.unsplash.com/photo-1464822759844-d150baec3cee?w=300&h=200&fit=crop',
    lumaUrl: 'https://lumalabs.ai/capture/089bc8d0-23e0-4ef7-8a72-d028d0dd86ab'
  }
]

export default function MemoryGallery() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent')
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false)
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false)
  const [useBlockchainData, setUseBlockchainData] = useState(false)

  // Blockscout SDK hooks
  const { openTxToast } = useNotification()
  const { openPopup } = useTransactionPopup()

  // Load NFT data from Blockscout API
  const loadNFTsFromBlockchain = async () => {
    setIsLoadingNFTs(true)
    try {
      const nftInstances = await fetchNFTInstances(MEMORA_CONTRACT_ADDRESS)
      
      if (nftInstances.length > 0) {
        const convertedMemories = nftInstances.map(convertNFTToMemory)
        setMemories(convertedMemories)
        setUseBlockchainData(true)
        toast.success(`Loaded ${convertedMemories.length} memories from blockchain!`)
      } else {
        toast.error('No NFTs found for this contract. Using sample data.')
        // Fallback to sample data
        initializeSampleMemories()
      }
    } catch (error) {
      console.error('Failed to load NFTs from blockchain:', error)
      toast.error('Failed to load blockchain data. Using sample data.')
      // Fallback to sample data
      initializeSampleMemories()
    }
    setIsLoadingNFTs(false)
  }

  // Initialize memories with connected wallet as owner of first memory for demo
  const initializeSampleMemories = () => {
    const memoriesWithOwnership = SAMPLE_MEMORIES.map(memory => ({
      ...memory,
      owner: memory.owner === 'USER_WALLET' && connectedAddress 
        ? connectedAddress 
        : memory.owner
    }))
    setMemories(memoriesWithOwnership)
    setUseBlockchainData(false)
  }

  useEffect(() => {
    if (connectedAddress) {
      // Try to load real NFT data first
      loadNFTsFromBlockchain()
    } else {
      initializeSampleMemories()
    }
  }, [connectedAddress])

  // Check wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            const signer = await provider.getSigner()
            const address = await signer.getAddress()
            setConnectedAddress(address.toLowerCase())
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error)
        }
      }
    }

    checkWalletConnection()

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setConnectedAddress(accounts[0].toLowerCase())
        } else {
          setConnectedAddress(null)
        }
      }

      const ethereum = window.ethereum
      ethereum.on('accountsChanged', handleAccountsChanged)
      
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  useEffect(() => {
    let filtered = memories

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(memory =>
        memory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by emotion
    if (selectedEmotion !== 'all') {
      filtered = filtered.filter(memory => memory.emotion === selectedEmotion)
    }

    // Sort memories
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes
        case 'views':
          return b.views - a.views
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredMemories(filtered)
  }, [memories, searchTerm, selectedEmotion, sortBy])

  const formatAddress = (address: string) => {
    return formatAddr(address)
  }

  const isOwner = (memory: Memory) => {
    return Boolean(connectedAddress && memory.owner.toLowerCase() === connectedAddress.toLowerCase())
  }

  const handleLike = (memoryId: string) => {
    setMemories(prev => prev.map(memory =>
      memory.id === memoryId
        ? { ...memory, likes: memory.likes + 1 }
        : memory
    ))
  }

  const handleView3D = (memory: Memory) => {
    // Increment view count
    setMemories(prev => prev.map(m =>
      m.id === memory.id
        ? { ...m, views: m.views + 1 }
        : m
    ))
    
    setSelectedMemory(memory)
    setIs3DViewerOpen(true)
  }

  // Show transaction history using Blockscout SDK
  const showTransactionHistory = () => {
    if (connectedAddress) {
      openPopup({
        chainId: getChainId(), // Sepolia chain ID
        address: connectedAddress,
      })
    } else {
      toast.error('Please connect your wallet first')
    }
  }

  // Simulate transaction notification
  const simulateTransaction = async () => {
    if (!connectedAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      // Example transaction hash - replace with real transaction
      const txHash = '0x1234567890123456789012345678901234567890123456789012345678901234'
      await openTxToast(getChainId(), txHash) // Sepolia chain ID
    } catch (error) {
      console.error('Error showing transaction toast:', error)
      toast.error('Failed to show transaction notification')
    }
  }

  const emotions = ['all', 'Happy', 'Excited', 'Peaceful', 'Nostalgic', 'Inspired', 'Grateful', 'Adventurous']

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Memory Gallery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore 3D memories created by the community. Each memory is a unique NFT stored on IPFS.
          </p>
          
          {connectedAddress && (
            <div className="mt-6 p-4 glass rounded-lg max-w-4xl mx-auto">
              <p className="text-sm text-green-400 mb-2">
                ✅ Connected as {formatAddress(connectedAddress)}
              </p>
              <div className="text-sm text-gray-300 space-y-1">
                {useBlockchainData ? (
                  <>
                    <p>🔗 <strong>Live Blockchain Data:</strong> Displaying real NFTs from Ethereum Sepolia!</p>
                    <p>📊 <strong>Blockscout Integration:</strong> Real-time transaction notifications and explorer links</p>
                  </>
                ) : (
                  <>
                    <p>🎉 <strong>Demo Mode:</strong> The first memory (Zion National Park) is now owned by your wallet!</p>
                    <p>💡 <strong>Deploy Contract:</strong> Deploy Memora NFT contract to see real blockchain data</p>
                  </>
                )}
                <p>👑 <strong>Owned memories</strong> show a crown icon and "OWNED" badge</p>
                <p>🔒 <strong>Other memories</strong> show a lock icon (preview mode only)</p>
                <p>🌟 <strong>Click any memory</strong> to view it in 3D - owners get full access, others get preview</p>
              </div>
              
              {/* Blockscout SDK Demo Buttons */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <button
                  onClick={showTransactionHistory}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs flex items-center space-x-1"
                >
                  <History className="h-3 w-3" />
                  <span>Transaction History</span>
                </button>
                <button
                  onClick={simulateTransaction}
                  className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-xs"
                >
                  Demo TX Notification
                </button>
                <button
                  onClick={loadNFTsFromBlockchain}
                  disabled={isLoadingNFTs}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-xs flex items-center space-x-1 disabled:opacity-50"
                >
                  {isLoadingNFTs ? <Loader className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                  <span>Reload NFTs</span>
                </button>
              </div>
            </div>
          )}
          
          {!connectedAddress && (
            <div className="mt-6 p-4 bg-orange-500/20 border border-orange-500/30 rounded-lg max-w-2xl mx-auto">
              <p className="text-orange-400 text-sm mb-2">
                💡 <strong>Connect your wallet</strong> to see NFT ownership in action!
              </p>
              <p className="text-gray-300 text-xs">
                When connected, you'll own the first memory as a demo and can see the difference between owned vs. non-owned NFT experiences.
                We'll also try to load real NFT data from the blockchain using the Blockscout API.
              </p>
            </div>
          )}
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedEmotion}
                onChange={(e) => setSelectedEmotion(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none"
              >
                {emotions.map(emotion => (
                  <option key={emotion} value={emotion}>
                    {emotion === 'all' ? 'All Emotions' : emotion}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Liked</option>
                <option value="views">Most Viewed</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-white/20 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-500' : 'bg-white/5'} transition-colors`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-500' : 'bg-white/5'} transition-colors`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Memory Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {filteredMemories.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">No memories found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemories.map((memory, index) => {
                const owned = isOwner(memory)
                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 * index }}
                    className="memory-card group cursor-pointer relative"
                    onClick={() => handleView3D(memory)}
                  >
                    {/* Ownership indicator */}
                    {owned && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="flex items-center space-x-1 bg-yellow-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                          <Crown className="h-4 w-4 text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-semibold">YOURS</span>
                        </div>
                      </div>
                    )}

                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={memory.thumbnail}
                        alt={memory.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <button className={`w-full px-4 py-2 backdrop-blur-sm rounded-lg font-semibold flex items-center justify-center space-x-2 ${
                            owned 
                              ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
                              : 'bg-white/20 text-white'
                          }`}>
                            <Sparkles className="h-4 w-4" />
                            <span>{owned ? 'View Your 3D Memory' : 'Preview 3D Memory'}</span>
                          </button>
                        </div>
                      </div>
                      {!owned && (
                        <div className="absolute top-2 left-2">
                          <div className="flex items-center space-x-1 bg-orange-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                            <Lock className="h-3 w-3 text-orange-400" />
                            <span className="text-xs text-orange-400">Preview</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold line-clamp-1">{memory.name}</h3>
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                          {memory.emotion}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm line-clamp-2">{memory.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{memory.location}</span>
                        <span>{memory.createdAt}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {memory.views}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(memory.id)
                            }}
                            className="flex items-center hover:text-red-400 transition-colors"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {memory.likes}
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {owned && (
                            <span className="text-xs text-green-400 font-semibold">
                              OWNED
                            </span>
                          )}
                          <span className="text-xs text-gray-500 font-mono">
                            {formatAddress(memory.owner)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMemories.map((memory, index) => {
                const owned = isOwner(memory)
                return (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 * index }}
                    className="memory-card flex items-center space-x-6 cursor-pointer relative"
                    onClick={() => handleView3D(memory)}
                  >
                    <div className="relative">
                      <img
                        src={memory.thumbnail}
                        alt={memory.name}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                      {owned && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500/20 backdrop-blur-sm rounded-full px-1">
                          <Crown className="h-3 w-3 text-yellow-400" />
                        </div>
                      )}
                      {!owned && (
                        <div className="absolute top-1 left-1 bg-orange-500/20 backdrop-blur-sm rounded-full px-1">
                          <Lock className="h-3 w-3 text-orange-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold truncate">{memory.name}</h3>
                        <div className="flex items-center space-x-2 ml-2">
                          <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                            {memory.emotion}
                          </span>
                          {owned && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                              OWNED
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-1 mb-2">{memory.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{memory.location} • {memory.createdAt}</span>
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {memory.views}
                          </span>
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {memory.likes}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(getBlockscoutURL(`tx/${memory.txHash}`), '_blank')
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="View on Blockscout Explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* 3D Viewer Modal */}
      {selectedMemory && (
        <LumaSplatsViewer
          isOpen={is3DViewerOpen}
          onClose={() => {
            setIs3DViewerOpen(false)
            setSelectedMemory(null)
          }}
          lumaUrl={selectedMemory.lumaUrl || 'https://lumalabs.ai/capture/089bc8d0-23e0-4ef7-8a72-d028d0dd86ab'}
          memoryName={selectedMemory.name}
          memoryDescription={selectedMemory.description}
          isOwned={isOwner(selectedMemory)}
        />
      )}
    </div>
  )
} 