'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera, FileText, MapPin, Heart, Tag, Loader, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function UploadMemory() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    emotion: 'Happy',
    tags: '',
    textContent: ''
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const emotions = ['Happy', 'Excited', 'Peaceful', 'Nostalgic', 'Inspired', 'Grateful', 'Adventurous', 'Romantic', 'Proud', 'Energetic']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVideoSelect = (file: File) => {
    if (file.type.startsWith('video/')) {
      setVideoFile(file)
      toast.success('Video selected successfully!')
    } else {
      toast.error('Please select a valid video file')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find(file => file.type.startsWith('video/'))
    if (videoFile) {
      handleVideoSelect(videoFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!formData.name.trim()) errors.push('Memory name is required')
    if (!formData.description.trim()) errors.push('Description is required')
    if (!formData.location.trim()) errors.push('Location is required')
    if (!formData.textContent.trim()) errors.push('Memory text content is required')
    if (!videoFile) errors.push('Video file is required')
    
    return errors
  }

  const handleUpload = async () => {
    // Validate form
    const errors = validateForm()
    if (errors.length > 0) {
      toast.error(`Please fix the following errors:\n${errors.join('\n')}`)
      return
    }

    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    try {
      // Simulate upload process with fake progress
      toast.loading('Processing video...', { id: 'processing' })
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.loading('Converting to 3D scene...', { id: 'processing' })
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.loading('Generating metadata...', { id: 'processing' })
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.loading('Uploading to IPFS...', { id: 'processing' })
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.dismiss('processing')

      // Generate fake CID and result
      const fakeCid = 'QmFakeDemo' + Math.random().toString(36).substring(2, 15)
      const fakeResult = {
        success: true,
        cid: fakeCid,
        ipfsUrl: `ipfs://${fakeCid}`,
        gatewayUrl: `https://gateway.lighthouse.storage/ipfs/${fakeCid}`,
        metadataUrl: `ipfs://${fakeCid}/metadata.json`,
        sceneUrl: `ipfs://${fakeCid}/scene.ply`
      }

      setUploadResult(fakeResult)

      // Show success notification
      toast.success(
        <div>
          <p className="font-semibold">🎉 Memory NFT Created Successfully!</p>
          <p className="text-sm text-gray-300 mt-1">
            Your "{formData.name}" memory has been transformed into a 3D NFT
          </p>
          <p className="text-xs text-blue-400 mt-1">
            CID: {fakeCid.slice(0, 12)}...
          </p>
        </div>,
        { 
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, #0ea5e9, #d946ef)',
            color: 'white',
            border: 'none',
          }
        }
      )

      // Reset form
      setFormData({
        name: '',
        description: '',
        location: '',
        emotion: 'Happy',
        tags: '',
        textContent: ''
      })
      setVideoFile(null)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed - please try again')
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setUploadResult(null)
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Upload Memory
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your cherished moments into permanent 3D NFTs. Upload your video and memories to create an immersive experience.
          </p>
        </motion.div>

        {/* Upload Results Display */}
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 glass rounded-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="h-6 w-6" />
                <h3 className="text-lg font-semibold">🎉 NFT Created Successfully!</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">IPFS CID:</p>
                  <p className="font-mono text-blue-400">{uploadResult.cid}</p>
                </div>
                <div>
                  <p className="text-gray-400">Memory Name:</p>
                  <p className="text-green-400">{formData.name}</p>
                </div>
              </div>

              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300 text-sm">
                  ✅ <strong>Demo Success!</strong> Your memory has been processed and would be uploaded to IPFS in production.
                  The 3D scene, metadata JSON, and all files are ready for NFT minting!
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => toast.success('Would open metadata JSON in production!')}
                  className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                >
                  📄 View Metadata JSON
                </button>
                <button
                  onClick={() => toast.success('Would open 3D scene viewer in production!')}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                >
                  🎬 View 3D Scene
                </button>
                <button
                  onClick={resetUpload}
                  className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors text-sm"
                >
                  📝 Create Another
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass rounded-xl p-8"
        >
          <div className="space-y-6">
            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Video File</label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary-400 bg-primary-400/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => videoInputRef.current?.click()}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
                  className="hidden"
                />
                
                {videoFile ? (
                  <div className="space-y-2">
                    <Camera className="h-8 w-8 text-green-400 mx-auto" />
                    <p className="text-green-400 font-medium">{videoFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-gray-400">
                      Drop your video here or click to select
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports MP4, MOV, AVI and other video formats
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Memory Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Memory Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Summer vacation at the beach"
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Malibu Beach, California"
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe what made this memory special..."
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Emotion</label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="emotion"
                    value={formData.emotion}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none appearance-none"
                  >
                    {emotions.map(emotion => (
                      <option key={emotion} value={emotion}>{emotion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="beach, friends, sunset, vacation"
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Memory Story</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="textContent"
                  value={formData.textContent}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell the full story of this memory. What happened? Who was there? What made it special?"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none resize-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This story will be stored with your memory and used for AI-powered interactions.
              </p>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Creating 3D Memory NFT...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Create 3D Memory NFT</span>
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-500">
              <p className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-blue-300">
                🎯 <strong>Demo Mode:</strong> This will simulate the complete memory upload process with a success notification.
                In production, this would actually upload to IPFS and generate real NFT metadata.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 