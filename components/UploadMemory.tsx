'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera, FileText, MapPin, Heart, Tag, Loader, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { uploadMemoryToIPFS, getMemoryFileUrls, UploadProgress, UploadResult } from '../lib/ipfs-upload'
import { MemoryUploadData } from '../lib/metadata'

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
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
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
      // Prepare upload data
      const uploadData: MemoryUploadData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        emotion: formData.emotion,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        videoFile,
        textContent: formData.textContent,
        timestamp: new Date().toISOString().split('T')[0]
      }

      // Upload to IPFS with progress tracking
      const result = await uploadMemoryToIPFS(uploadData, (progress) => {
        setUploadProgress(progress)
        
        // Show stage-specific toasts
        if (progress.stage === 'processing' && progress.progress === 20) {
          toast.loading('Converting video to 3D scene...', { id: 'processing' })
        } else if (progress.stage === 'uploading' && progress.progress === 80) {
          toast.dismiss('processing')
          toast.loading('Uploading to IPFS...', { id: 'uploading' })
        } else if (progress.stage === 'complete') {
          toast.dismiss('uploading')
          toast.success('Upload complete!', { id: 'complete' })
        } else if (progress.stage === 'error') {
          toast.dismiss()
          toast.error(`Upload failed: ${progress.error}`)
        }
      })

      setUploadResult(result)

      if (result.success && result.cid) {
        toast.success('Memory successfully uploaded to IPFS!')
        
        // Get file URLs for display
        const fileUrls = getMemoryFileUrls(result.cid)
        console.log('📁 Memory files:', fileUrls)
        
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
        
        // Show success with links
        toast.success(
          <div>
            <p>Memory uploaded! CID: {result.cid.slice(0, 12)}...</p>
            <button 
              onClick={() => window.open(result.gatewayUrl, '_blank')}
              className="text-blue-400 underline text-sm"
            >
              View on IPFS Gateway
            </button>
          </div>,
          { duration: 6000 }
        )
        
      } else {
        throw new Error(result.error || 'Upload failed')
      }

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  const resetUpload = () => {
    setUploadResult(null)
    setUploadProgress(null)
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
            {uploadResult.success ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Upload Successful!</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">IPFS CID:</p>
                    <p className="font-mono text-blue-400">{uploadResult.cid}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Gateway URL:</p>
                    <a 
                      href={uploadResult.gatewayUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center space-x-1"
                    >
                      <span>View Files</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => window.open(uploadResult.metadataUrl, '_blank')}
                    className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                  >
                    View Metadata JSON
                  </button>
                  <button
                    onClick={() => window.open(uploadResult.sceneUrl, '_blank')}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    View 3D Scene
                  </button>
                  <button
                    onClick={resetUpload}
                    className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors text-sm"
                  >
                    Upload Another
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">Upload Failed</h3>
                </div>
                <p className="text-gray-400">{uploadResult.error}</p>
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 glass rounded-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Loader className="h-5 w-5 animate-spin text-blue-400" />
                <h3 className="text-lg font-semibold">{uploadProgress.message}</h3>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-400">
                <span>Stage: {uploadProgress.stage}</span>
                <span>{Math.round(uploadProgress.progress)}%</span>
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
                  <span>Processing & Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Create 3D Memory NFT</span>
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-500">
              <p>Your memory will be processed into a 3D scene and stored permanently on IPFS.</p>
              <p>The generated metadata will include all details for NFT minting.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 