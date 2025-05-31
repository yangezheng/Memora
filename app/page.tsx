'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Upload, Coins, Sparkles, ArrowRight, Github, Twitter } from 'lucide-react'
import UploadMemory from '@/components/UploadMemory'
import MemoryGallery from '@/components/MemoryGallery'
import WalletConnect from '@/components/WalletConnect'

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'upload' | 'gallery'>('home')

  return (
    <div className="min-h-screen text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setCurrentView('home')}
            >
              <Brain className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold gradient-text">Memora</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setCurrentView('home')}
                className={`hover:text-primary-400 transition-colors ${currentView === 'home' ? 'text-primary-400' : ''}`}
              >
                Home
              </button>
              <button 
                onClick={() => setCurrentView('upload')}
                className={`hover:text-primary-400 transition-colors ${currentView === 'upload' ? 'text-primary-400' : ''}`}
              >
                Upload
              </button>
              <button 
                onClick={() => setCurrentView('gallery')}
                className={`hover:text-primary-400 transition-colors ${currentView === 'gallery' ? 'text-primary-400' : ''}`}
              >
                Gallery
              </button>
            </div>
            
            <WalletConnect />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        {currentView === 'home' && <HomePage setCurrentView={setCurrentView} />}
        {currentView === 'upload' && <UploadMemory />}
        {currentView === 'gallery' && <MemoryGallery />}
      </div>
    </div>
  )
}

function HomePage({ setCurrentView }: { setCurrentView: (view: 'home' | 'upload' | 'gallery') => void }) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Transform <span className="gradient-text">Memories</span>
              <br />into <span className="gradient-text">3D NFTs</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Turn personal memories into on-chain 3D scenes you can own, revisit, and share — all secured with NFTs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => setCurrentView('upload')}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full font-semibold flex items-center justify-center space-x-2 hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 glow-box"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-5 w-5" />
                <span>Upload Memory</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                onClick={() => setCurrentView('gallery')}
                className="px-8 py-4 glass rounded-full font-semibold flex items-center justify-center space-x-2 hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-5 w-5" />
                <span>Explore Gallery</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16 gradient-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            How It Works
          </motion.h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Upload,
                title: "Upload Memory",
                description: "Share your video and add context about the memory"
              },
              {
                icon: Brain,
                title: "3D Processing",
                description: "AI converts your memory into a beautiful 3D Gaussian Splat"
              },
              {
                icon: Sparkles,
                title: "IPFS Storage",
                description: "Secure permanent storage via Lighthouse on IPFS"
              },
              {
                icon: Coins,
                title: "NFT Minting",
                description: "Mint as NFT on Ethereum - own your memory forever"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="memory-card text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
              >
                <feature.icon className="h-12 w-12 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16 gradient-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Built With
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Frontend",
                items: ["Next.js", "React", "ethers.js", "Three.js"]
              },
              {
                title: "Storage",
                items: ["IPFS", "Lighthouse SDK", "Filecoin"]
              },
              {
                title: "Blockchain",
                items: ["Ethereum", "Solidity", "ERC-721", "Sepolia"]
              }
            ].map((category, index) => (
              <motion.div
                key={index}
                className="memory-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
              >
                <h3 className="text-xl font-semibold mb-4 text-primary-400">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-300">{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center space-x-6 mb-6">
            <Brain className="h-8 w-8 text-primary-400" />
            <span className="text-2xl font-bold gradient-text">Memora</span>
          </div>
          <div className="flex justify-center space-x-6 mb-6">
            <Github className="h-6 w-6 text-gray-400 hover:text-primary-400 cursor-pointer transition-colors" />
            <Twitter className="h-6 w-6 text-gray-400 hover:text-primary-400 cursor-pointer transition-colors" />
          </div>
          <p className="text-gray-400">
            Built for ETHGlobal - Transform memories into 3D NFTs
          </p>
        </div>
      </footer>
    </>
  )
} 