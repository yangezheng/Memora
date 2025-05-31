'use client'

import React, { useState, useEffect } from 'react'
import { Wallet } from 'lucide-react'
import { useNotification } from '@blockscout/app-sdk'
import { formatAddress } from '../lib/blockscout'
import { toast } from 'react-hot-toast'
import { ethers } from 'ethers'

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  
  const { openTxToast } = useNotification()

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
          setAddress(address)
          setBalance(ethers.formatEther(balance))
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
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
      
      // Check if we're on Sepolia network
      const network = await provider.getNetwork()
      if (network.chainId !== BigInt(11155111)) { // Sepolia chain ID
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          })
          toast.success('Switched to Sepolia testnet!')
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Add Sepolia network
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Test Network',
                    nativeCurrency: {
                      name: 'Ethereum',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://eth-sepolia.blockscout.com/'],
                  },
                ],
              })
              toast.success('Added Sepolia testnet!')
            } catch (addError) {
              console.error('Error adding network:', addError)
              toast.error('Failed to add Sepolia network')
            }
          }
        }
      }

      await checkConnection()
      toast.success('Wallet connected successfully!')
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      if (error.code === 4001) {
        toast.error('Connection rejected by user')
      } else {
        toast.error('Failed to connect wallet')
      }
    }
    setIsConnecting(false)
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance(null)
    toast.success('Wallet disconnected')
  }

  const openInBlockscout = () => {
    if (address) {
      window.open(`https://eth-sepolia.blockscout.com/address/${address}`, '_blank')
    }
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-4 py-2 glass rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="text-sm">
            <div className="font-semibold">{formatAddress(address)}</div>
            {balance && (
              <div className="text-xs text-gray-400">{parseFloat(balance).toFixed(4)} ETH</div>
            )}
          </div>
        </div>
        
        <button
          onClick={openInBlockscout}
          className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
          title="View on Blockscout"
        >
          Explorer
        </button>
        
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
        >
          Disconnect
        </button>
      </div>
    )
  }

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