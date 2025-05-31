'use client'

import React, { useState, useEffect } from 'react'
import { Wallet, ChevronDown, Copy, ExternalLink } from 'lucide-react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

interface WalletState {
  address: string | null
  balance: string | null
  network: string | null
  isConnected: boolean
}

export default function WalletConnect() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: null,
    network: null,
    isConnected: false
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          const balance = await provider.getBalance(address)
          const network = await provider.getNetwork()
          
          setWallet({
            address,
            balance: ethers.formatEther(balance),
            network: network.name,
            isConnected: true
          })
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('Please install MetaMask!')
      return
    }

    setIsConnecting(true)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      await checkConnection()
      toast.success('Wallet connected successfully!')
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      if (error.code === 4001) {
        toast.error('Wallet connection rejected')
      } else {
        toast.error('Failed to connect wallet')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setWallet({
      address: null,
      balance: null,
      network: null,
      isConnected: false
    })
    setIsDropdownOpen(false)
    toast.success('Wallet disconnected')
  }

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      toast.success('Address copied!')
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const openInBlockscout = () => {
    if (wallet.address) {
      window.open(`https://sepolia.blockscout.com/address/${wallet.address}`, '_blank')
    }
  }

  if (!wallet.isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 disabled:opacity-50"
      >
        <Wallet className="h-4 w-4" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-4 py-2 glass rounded-full hover:bg-white/20 transition-all duration-300"
      >
        <Wallet className="h-4 w-4 text-green-400" />
        <span className="font-medium">{formatAddress(wallet.address!)}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 glass rounded-xl border border-white/20 p-4 z-50">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Address</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{formatAddress(wallet.address!)}</span>
                <div className="flex space-x-2">
                  <button onClick={copyAddress} className="p-1 hover:bg-white/10 rounded">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={openInBlockscout} className="p-1 hover:bg-white/10 rounded">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Balance</p>
              <p className="font-semibold">{parseFloat(wallet.balance!).toFixed(4)} ETH</p>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Network</p>
              <p className="font-semibold capitalize">{wallet.network}</p>
            </div>

            <button
              onClick={disconnectWallet}
              className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 