'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, X } from 'lucide-react'
import { sendAudioMessage, type ChatMessage } from '@/lib/azure-openai'
import toast from 'react-hot-toast'

// Speech Recognition types
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    webkitAudioContext: any
  }
}

interface VoiceAIProps {
  memoryName: string
  memoryDescription: string
  isOwned: boolean
  isActive: boolean
  onToggle: () => void
}

interface Conversation {
  id: string
  message: string
  isUser: boolean
  timestamp: Date
  audio?: ArrayBuffer
}

export default function VoiceAI({ 
  memoryName, 
  memoryDescription, 
  isOwned, 
  isActive, 
  onToggle 
}: VoiceAIProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversation, setConversation] = useState<Conversation[]>([])
  const [showTranscript, setShowTranscript] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const currentAudioRef = useRef<AudioBufferSourceNode | null>(null)

  // Initialize audio recording
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Initialize audio context
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
        console.log('🎵 Audio context initialized')
      } catch (error) {
        console.error('Audio context initialization failed:', error)
      }
    }

    initializeAudio()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      console.log('🎤 Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })

      audioChunksRef.current = []
      
      // Try to use WAV format if supported, otherwise fall back to WebM
      let mimeType = 'audio/wav'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm;codecs=opus'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm'
        }
      }
      
      console.log('🎤 Using audio format:', mimeType)

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        console.log('🎤 Recording stopped, processing audio...')
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        
        await handleAudioMessage(audioBlob)
      }

      mediaRecorderRef.current.onerror = (event) => {
        console.error('🎤 MediaRecorder error:', event)
        toast.error('Recording failed')
        setIsListening(false)
      }

      mediaRecorderRef.current.start()
      setIsListening(true)
      console.log('🎤 Recording started')

    } catch (error) {
      console.error('🎤 Failed to start recording:', error)
      toast.error('Could not access microphone')
      setIsListening(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      console.log('🎤 Stopping recording...')
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  const handleAudioMessage = async (audioBlob: Blob) => {
    try {
      console.log('💬 Processing audio message, size:', audioBlob.size, 'type:', audioBlob.type)
      setIsProcessing(true)

      // Convert to WAV format for API compatibility
      const wavBlob = await convertToWav(audioBlob)
      console.log('🔄 Converted to WAV, size:', wavBlob.size)

      // Add user message to conversation (with placeholder text)
      const userConversation: Conversation = {
        id: Date.now().toString(),
        message: '[Audio message]',
        isUser: true,
        timestamp: new Date(),
        audio: await wavBlob.arrayBuffer()
      }
      setConversation(prev => [...prev, userConversation])

      // Prepare chat messages for API - keep only the last few text exchanges to maintain context
      // but don't include audio messages to avoid format issues
      const recentTextMessages = conversation
        .filter(conv => !conv.audio) // Only text messages
        .slice(-4) // Keep last 4 text messages for context
        .map(conv => ({
          role: conv.isUser ? 'user' as const : 'assistant' as const,
          content: conv.message
        }))

      console.log('🔄 Sending audio to Azure OpenAI with context:', recentTextMessages.length, 'previous messages')

      // Get AI response with audio
      const aiResponse = await sendAudioMessage(wavBlob, recentTextMessages, {
        name: memoryName,
        description: memoryDescription,
        isOwned
      })

      console.log('✅ AI Response received:', aiResponse.text)
      console.log('🎵 Audio response present:', !!aiResponse.audio, 'size:', aiResponse.audio?.byteLength || 0)

      // Add AI response to conversation
      const aiConversation: Conversation = {
        id: (Date.now() + 1).toString(),
        message: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        audio: aiResponse.audio
      }
      setConversation(prev => [...prev, aiConversation])

      // Show success toast
      toast.success('AI responded with audio!')

      // Play the audio response if available and voice is enabled
      if (voiceEnabled && aiResponse.audio && aiResponse.audio.byteLength > 0) {
        console.log('🔊 Playing AI audio response')
        await playAudioBuffer(aiResponse.audio)
      } else {
        console.log('🔇 No audio response or voice disabled. Audio size:', aiResponse.audio?.byteLength || 0)
        // If no audio, show a warning
        if (!aiResponse.audio || aiResponse.audio.byteLength === 0) {
          toast('No audio in AI response - using text only', { icon: '🔇' })
        }
      }

    } catch (error) {
      console.error('❌ Failed to process audio message:', error)
      toast.error('Failed to get AI response. Please try again.')
      
      // Add error message to conversation
      const errorConversation: Conversation = {
        id: (Date.now() + 2).toString(),
        message: "Sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      }
      setConversation(prev => [...prev, errorConversation])
    } finally {
      setIsProcessing(false)
    }
  }

  const convertToWav = async (blob: Blob): Promise<Blob> => {
    try {
      console.log('🔄 Converting audio to WAV format...')
      
      // If it's already WAV, return as-is
      if (blob.type.includes('wav')) {
        console.log('✅ Already WAV format')
        return blob
      }
      
      // Create audio context for conversion
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer()
      
      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // Convert to WAV format
      const wavArrayBuffer = audioBufferToWav(audioBuffer)
      const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' })
      
      console.log('✅ Audio converted to WAV')
      return wavBlob
      
    } catch (error) {
      console.error('❌ Audio conversion failed:', error)
      // Return original blob as fallback
      return blob
    }
  }

  // Helper function to convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length
    const sampleRate = buffer.sampleRate
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)
    const channels = buffer.numberOfChannels
    const sample = new Float32Array(length)
    
    // Get audio data (mix to mono if stereo)
    if (channels === 1) {
      buffer.copyFromChannel(sample, 0)
    } else {
      const left = new Float32Array(length)
      const right = new Float32Array(length)
      buffer.copyFromChannel(left, 0)
      buffer.copyFromChannel(right, 1)
      for (let i = 0; i < length; i++) {
        sample[i] = (left[i] + right[i]) / 2
      }
    }
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * 2, true)
    
    // Convert samples to 16-bit PCM
    let offset = 44
    for (let i = 0; i < length; i++) {
      const s = Math.max(-1, Math.min(1, sample[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
      offset += 2
    }
    
    return arrayBuffer
  }

  const playAudioBuffer = async (audioBuffer: ArrayBuffer) => {
    if (!audioContextRef.current || !voiceEnabled) return

    try {
      setIsSpeaking(true)
      
      const audioCtx = audioContextRef.current
      const buffer = await audioCtx.decodeAudioData(audioBuffer.slice(0))
      
      const source = audioCtx.createBufferSource()
      source.buffer = buffer
      source.connect(audioCtx.destination)
      
      currentAudioRef.current = source
      
      source.onended = () => {
        setIsSpeaking(false)
        currentAudioRef.current = null
      }
      
      source.start(0)
      console.log('🔊 Audio playback started')

    } catch (error) {
      console.error('🔊 Audio playback error:', error)
      setIsSpeaking(false)
      toast.error('Audio playback failed')
    }
  }

  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.stop()
      currentAudioRef.current = null
      setIsSpeaking(false)
    }
  }, [])

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isSpeaking) {
      stopSpeaking()
    }
  }

  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 right-4 z-20"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Main AI Control */}
      <div className="glass rounded-2xl p-4 min-w-[300px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Memory AI</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowTranscript(!showTranscript)
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Chat History"
            >
              <MessageSquare className="h-4 w-4 text-white" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleVoice()
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={voiceEnabled ? "Disable Voice" : "Enable Voice"}
            >
              {voiceEnabled ? (
                <Volume2 className="h-4 w-4 text-white" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-400" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close AI"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-center space-x-4">
          <motion.button
            onClick={(e) => {
              e.stopPropagation() // Prevent event bubbling
              isListening ? stopRecording() : startRecording()
            }}
            disabled={isProcessing}
            className={`relative p-4 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 shadow-lg shadow-red-500/30' 
                : isProcessing
                ? 'bg-yellow-500 shadow-lg shadow-yellow-500/30'
                : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
            }`}
            whileTap={{ scale: 0.95 }}
            animate={isListening ? { 
              boxShadow: [
                '0 0 0 0 rgba(239, 68, 68, 0.7)',
                '0 0 0 10px rgba(239, 68, 68, 0)',
                '0 0 0 0 rgba(239, 68, 68, 0.7)',
              ] 
            } : {}}
            transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
          >
            {isListening ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </motion.button>

          <div className="text-center">
            <p className="text-white text-sm">
              {isListening ? 'Recording...' :
               isProcessing ? 'Processing...' :
               isSpeaking ? 'Speaking...' :
               'Click to record'}
            </p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-3 flex justify-center space-x-4 text-xs">
          <span className={`${isOwned ? 'text-green-400' : 'text-orange-400'}`}>
            {isOwned ? '✅ Full Access' : '👀 Preview Mode'}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-blue-400">Azure OpenAI</span>
        </div>
      </div>

      {/* Chat Transcript */}
      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass rounded-2xl p-4 mt-4 max-h-96 overflow-y-auto"
          >
            <h3 className="text-white font-semibold mb-3">Conversation</h3>
            
            {conversation.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                No conversation yet. Click the mic to start recording!
              </p>
            ) : (
              <div className="space-y-3">
                {conversation.map((item) => (
                  <div key={item.id} className={`flex ${item.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      item.isUser 
                        ? 'bg-blue-500/20 text-blue-100 ml-4' 
                        : 'bg-gray-500/20 text-gray-100 mr-4'
                    }`}>
                      <p>{item.message}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 