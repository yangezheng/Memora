'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List, Crown, Lock, ExternalLink, Eye, Calendar, MapPin, Tag } from 'lucide-react'
import LumaSplatsViewer from './LumaSplatsViewer'

interface Memory {
  id: string
  name: string
  description: string
  imageUrl: string
  sceneUrl: string
  owner: string
  tokenId: string
  location?: string
  emotion?: string
  tags?: string[]
  createdAt: string
  isOwned?: boolean
}

export default function MemoryGallery() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [connectedAddress, setConnectedAddress] = useState<string>('')

  const emotions = ['All', 'Happy', 'Excited', 'Peaceful', 'Nostalgic', 'Inspired', 'Grateful', 'Adventurous']

  // Get connected wallet address
  useEffect(() => {
    const getWalletAddress = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setConnectedAddress(accounts[0])
          }
        } catch (error) {
          console.error('Error getting wallet address:', error)
        }
      }
    }

    getWalletAddress()

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setConnectedAddress(accounts[0] || '')
      }
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  useEffect(() => {
    const loadDemoMemory = async () => {
      setIsLoading(true)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const demoMemory: Memory = {
        id: '1',
        name: 'EthGlobal at Prauge',
        description: 'An incredible 3D memory of the ETH Global hackathon in Prague, June 29 - July 1st 2025, with the Protocol Labs team.',
        imageUrl: '/memory-files/ethglobal/ethglobal.png', 
        sceneUrl: 'https://lumalabs.ai/capture/089bc8d0-23e0-4ef7-8a72-d028d0dd86ab', 
        owner: connectedAddress || '0x742d35Cc6634C0532925a3b8D78ABCC8B5c8a8a4',
        tokenId: '1',
        location: 'Zion National Park, Utah',
        emotion: 'Inspired',
        tags: ['hiking', 'nature', 'adventure', 'mountains', 'utah'],
        createdAt: '2024-01-15',
        isOwned: true // Always owned for demo
      }
      
      setMemories([demoMemory])
      setFilteredMemories([demoMemory])
      setIsLoading(false)
    }

    loadDemoMemory()
  }, [connectedAddress])

  useEffect(() => {
    let filtered = memories

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(memory =>
        memory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by emotion
    if (selectedEmotion !== 'All') {
      filtered = filtered.filter(memory => memory.emotion === selectedEmotion)
    }

    setFilteredMemories(filtered)
  }, [memories, searchTerm, selectedEmotion])

  const MemoryCard = ({ memory }: { memory: Memory }) => {
    const isOwned = memory.isOwned

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="glass rounded-xl overflow-hidden cursor-pointer group"
        onClick={() => setSelectedMemory(memory)}
      >
        <div className="relative">
          <img
            src={memory.imageUrl}
            alt={memory.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Ownership Badge */}
          <div className="absolute top-3 right-3">
            {isOwned ? (
              <div className="flex items-center space-x-1 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full px-2 py-1">
                <Crown className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">YOURS</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-gray-500/20 backdrop-blur-sm border border-gray-500/30 rounded-full px-2 py-1">
                <Lock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">Preview</span>
              </div>
            )}
          </div>

          {/* View Indicator */}
          <div className="absolute top-3 left-3">
            <div className="flex items-center space-x-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-2 py-1">
              <Eye className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">3D</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-400 transition-colors">
              {memory.name}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {memory.description}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {memory.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{memory.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{memory.createdAt}</span>
            </div>
          </div>

          {memory.tags && (
            <div className="flex flex-wrap gap-1">
              {memory.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
              {memory.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                  +{memory.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Token #{memory.tokenId}</span>
              <div className="flex items-center space-x-1 text-blue-400">
                <span>View 3D Scene</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

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
            Explore immersive 3D memories stored as NFTs. Experience the moments that matter most.
          </p>
        </motion.div>


        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 glass rounded-xl p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none"
              />
            </div>

            {/* Emotion Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedEmotion}
                onChange={(e) => setSelectedEmotion(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none appearance-none min-w-40"
              >
                {emotions.map(emotion => (
                  <option key={emotion} value={emotion}>{emotion}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading memories...</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {filteredMemories.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1 lg:grid-cols-2'
              }`}>
                {filteredMemories.map((memory, index) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MemoryCard memory={memory} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl mb-2">No memories found</p>
                  <p>Try adjusting your search or filters</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 3D Viewer Modal */}
        {selectedMemory && (
          <LumaSplatsViewer
            isOpen={!!selectedMemory}
            onClose={() => setSelectedMemory(null)}
            lumaUrl={selectedMemory.sceneUrl}
            memoryName={selectedMemory.name}
            memoryDescription={selectedMemory.description}
            isOwned={selectedMemory.isOwned || false}
          />
        )}

        {/* Summary Stats */}
        {!isLoading && filteredMemories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="glass rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-primary-400">{filteredMemories.length}</div>
                  <div className="text-sm text-gray-400">Total Memories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {filteredMemories.filter(m => m.isOwned).length}
                  </div>
                  <div className="text-sm text-gray-400">Owned by You</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">1</div>
                  <div className="text-sm text-gray-400">Demo Available</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 