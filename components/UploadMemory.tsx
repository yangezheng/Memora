'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, Video, FileText, Loader, CheckCircle, AlertCircle, Brain, Link } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import lighthouse from '@lighthouse-web3/sdk'
import toast from 'react-hot-toast'

interface UploadState {
  video: File | null
  description: string
  location: string
  emotion: string
  isUploading: boolean
  uploadProgress: number
  cid: string | null
  txHash: string | null
}

const LIGHTHOUSE_API_KEY = '2990024c.40dc50bbe7b94ffdb01c97f9943ae55d'

export default function UploadMemory() {
  const [uploadState, setUploadState] = useState<UploadState>({
    video: null,
    description: '',
    location: '',
    emotion: '',
    isUploading: false,
    uploadProgress: 0,
    cid: null,
    txHash: null
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('video/')) {
      setUploadState(prev => ({ ...prev, video: file }))
      toast.success('Video uploaded successfully!')
    } else {
      toast.error('Please upload a valid video file')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024 // 100MB
  })

  const handleInputChange = (field: keyof UploadState, value: string) => {
    setUploadState(prev => ({ ...prev, [field]: value }))
  }

  const processAndUpload = async () => {
    if (!uploadState.video || !uploadState.description) {
      toast.error('Please upload a video and add a description')
      return
    }

    setUploadState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }))

    try {
      // Step 1: Simulate 3D processing
      setUploadState(prev => ({ ...prev, uploadProgress: 20 }))
      toast.loading('Processing video into 3D scene...', { id: 'processing' })
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Step 2: Create metadata
      setUploadState(prev => ({ ...prev, uploadProgress: 40 }))
      toast.loading('Creating metadata...', { id: 'processing' })
      
      const metadata = {
        name: `Memory: ${uploadState.location || 'Untitled'}`,
        description: uploadState.description,
        animation_url: '', // Will be filled after upload
        attributes: [
          { trait_type: 'location', value: uploadState.location || 'Unknown' },
          { trait_type: 'emotion', value: uploadState.emotion || 'Neutral' },
          { trait_type: 'upload_date', value: new Date().toISOString() }
        ]
      }

      // Step 3: Upload to IPFS via Lighthouse
      setUploadState(prev => ({ ...prev, uploadProgress: 60 }))
      toast.loading('Uploading to IPFS...', { id: 'processing' })

      // Create a temporary directory structure
      const formData = new FormData()
      formData.append('file', uploadState.video)
      formData.append('metadata', JSON.stringify(metadata))

      // For demo purposes, we'll simulate the upload
      // In production, you'd call your backend API or integrate with Lighthouse directly
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate CID response
      const mockCid = 'QmYx5rJsHFQrWALQsGNHaKqFLR3EXRzM3Mj8A9zQeWvXyZ'
      
      setUploadState(prev => ({ ...prev, uploadProgress: 80, cid: mockCid }))
      toast.loading('Minting NFT...', { id: 'processing' })

      // Step 4: Simulate NFT minting
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      
      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 100, 
        txHash: mockTxHash,
        isUploading: false 
      }))

      toast.success('Memory successfully created as NFT!', { id: 'processing' })
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process memory', { id: 'processing' })
      setUploadState(prev => ({ ...prev, isUploading: false }))
    }
  }

  const resetUpload = () => {
    setUploadState({
      video: null,
      description: '',
      location: '',
      emotion: '',
      isUploading: false,
      uploadProgress: 0,
      cid: null,
      txHash: null
    })
  }

  if (uploadState.cid && uploadState.txHash) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div 
          className="max-w-2xl w-full glass rounded-2xl p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4 gradient-text">Memory Created Successfully!</h1>
          <p className="text-gray-300 mb-8">
            Your memory has been processed into a 3D scene and minted as an NFT on Ethereum.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <span className="text-gray-400">IPFS CID:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm">{uploadState.cid.slice(0, 20)}...</span>
                <Link className="h-4 w-4 text-primary-400 cursor-pointer" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <span className="text-gray-400">Transaction:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm">{uploadState.txHash!.slice(0, 20)}...</span>
                <Link className="h-4 w-4 text-primary-400 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open(`https://gateway.lighthouse.storage/ipfs/${uploadState.cid}`, '_blank')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300"
            >
              View 3D Scene
            </button>
            
            <button
              onClick={() => window.open(`https://sepolia.blockscout.com/tx/${uploadState.txHash}`, '_blank')}
              className="px-6 py-3 glass rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
            >
              View on Blockscout
            </button>
            
            <button
              onClick={resetUpload}
              className="px-6 py-3 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
            >
              Create Another
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Upload Your Memory
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your personal memory into a permanent 3D NFT that you can own and share forever.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Upload */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="memory-card"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Video className="h-6 w-6 mr-2 text-primary-400" />
              Video Upload
            </h2>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-primary-400 bg-primary-400/10' 
                  : 'border-gray-600 hover:border-primary-400/50'
              }`}
            >
              <input {...getInputProps()} />
              {uploadState.video ? (
                <div className="space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                  <p className="font-semibold text-green-400">{uploadState.video.name}</p>
                  <p className="text-sm text-gray-400">
                    {(uploadState.video.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-semibold mb-2">
                      {isDragActive ? 'Drop video here' : 'Upload your memory video'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Drag & drop or click to select • MP4, AVI, MOV • Max 100MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Memory Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="memory-card"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-primary-400" />
              Memory Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={uploadState.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this memory... What happened? How did it feel?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none resize-none"
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={uploadState.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Where did this happen?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Emotion</label>
                <select
                  value={uploadState.emotion}
                  onChange={(e) => handleInputChange('emotion', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none"
                >
                  <option value="">Select an emotion</option>
                  <option value="Happy">Happy</option>
                  <option value="Excited">Excited</option>
                  <option value="Peaceful">Peaceful</option>
                  <option value="Nostalgic">Nostalgic</option>
                  <option value="Inspired">Inspired</option>
                  <option value="Grateful">Grateful</option>
                  <option value="Adventurous">Adventurous</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upload Progress */}
        {uploadState.isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 memory-card"
          >
            <div className="flex items-center mb-4">
              <Brain className="h-6 w-6 mr-2 text-primary-400 animate-pulse" />
              <h3 className="text-xl font-semibold">Processing Memory</h3>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.uploadProgress}%` }}
              />
            </div>
            
            <p className="text-sm text-gray-400 text-center">
              {uploadState.uploadProgress < 40 ? 'Converting to 3D scene...' :
               uploadState.uploadProgress < 60 ? 'Creating metadata...' :
               uploadState.uploadProgress < 80 ? 'Uploading to IPFS...' :
               'Minting NFT...'}
            </p>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={processAndUpload}
            disabled={!uploadState.video || !uploadState.description || uploadState.isUploading}
            className="px-12 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full font-semibold text-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed glow-box"
          >
            {uploadState.isUploading ? (
              <span className="flex items-center">
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </span>
            ) : (
              'Create 3D Memory NFT'
            )}
          </button>
          
          <p className="text-sm text-gray-400 mt-4">
            Your memory will be processed into a 3D scene and minted as an NFT
          </p>
        </motion.div>
      </div>
    </div>
  )
} 