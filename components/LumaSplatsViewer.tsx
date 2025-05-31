'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Maximize2, RotateCcw, Info } from 'lucide-react'

interface LumaSplatsViewerProps {
  isOpen: boolean
  onClose: () => void
  lumaUrl: string
  memoryName: string
  memoryDescription: string
  isOwned: boolean
}

export default function LumaSplatsViewer({ 
  isOpen, 
  onClose, 
  lumaUrl, 
  memoryName, 
  memoryDescription,
  isOwned 
}: LumaSplatsViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const sceneRef = useRef<any>(null)

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    let renderer: any
    let scene: any
    let camera: any
    let controls: any
    let splat: any
    let animationId: number

    const initLumaSplats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const canvas = canvasRef.current!

        // Load Three.js from CDN
        const script1 = document.createElement('script')
        script1.type = 'importmap'
        script1.textContent = JSON.stringify({
          imports: {
            "three": "https://unpkg.com/three@0.157.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.157.0/examples/jsm/",
            "@lumaai/luma-web": "https://unpkg.com/@lumaai/luma-web@0.2.0/dist/library/luma-web.module.js"
          }
        })
        document.head.appendChild(script1)

        // Wait a bit for the importmap to be processed
        await new Promise(resolve => setTimeout(resolve, 100))

        // Dynamically import the modules
        const THREE = await import('three')
        const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')
        const { LumaSplatsThree } = await import('@lumaai/luma-web')

        // Set up WebGL renderer
        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: false
        })

        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

        scene = new THREE.Scene()
        renderer.setClearColor(new THREE.Color(0xffd1a4), 1)

        // Set up fog like in your HTML
        scene.fog = new THREE.FogExp2(
          new THREE.Color(0xffd1a4), 
          0.18
        )
        scene.background = scene.fog.color

        // Set up camera
        camera = new THREE.PerspectiveCamera(
          75, 
          canvas.clientWidth / canvas.clientHeight, 
          0.1, 
          1000
        )
        camera.position.set(0.9, 1.5, -1.0)

        // Set up controls
        controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        // Create LumaSplats object
        splat = new LumaSplatsThree({
          source: lumaUrl || 'https://lumalabs.ai/capture/089bc8d0-23e0-4ef7-8a72-d028d0dd86ab'
        })

        scene.add(splat)
        sceneRef.current = { renderer, scene, camera, controls, splat }

        // Animation loop
        const animate = () => {
          animationId = requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }

        animate()
        setIsLoading(false)

      } catch (err) {
        console.error('Error loading LumaSplats:', err)
        // Fallback to basic Three.js scene
        try {
          const THREE = await import('three')
          const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
          
          renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
          })

          renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
          scene = new THREE.Scene()
          scene.background = new THREE.Color(0x222222)

          camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
          camera.position.set(0, 0, 5)

          controls = new OrbitControls(camera, canvas)
          controls.enableDamping = true

          // Add a placeholder object
          const geometry = new THREE.SphereGeometry(1, 32, 32)
          const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            wireframe: true 
          })
          const sphere = new THREE.Mesh(geometry, material)
          scene.add(sphere)

          const animate = () => {
            animationId = requestAnimationFrame(animate)
            controls.update()
            sphere.rotation.y += 0.005
            renderer.render(scene, camera)
          }

          animate()
          setIsLoading(false)
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr)
          setError('Failed to load 3D scene. Please try again.')
          setIsLoading(false)
        }
      }
    }

    initLumaSplats()

    // Handle resize
    const handleResize = () => {
      if (camera && renderer && canvasRef.current) {
        const canvas = canvasRef.current
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (renderer) {
        renderer.dispose()
      }
      if (controls) {
        controls.dispose()
      }
      sceneRef.current = null
    }
  }, [isOpen, lumaUrl])

  const resetCamera = () => {
    if (sceneRef.current) {
      const { camera, controls } = sceneRef.current
      camera.position.set(0.9, 1.5, -1.0)
      if (controls.reset) {
        controls.reset()
      }
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 glass border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white truncate">{memoryName}</h1>
              {isOwned && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                  ✅ Owned
                </span>
              )}
              {!isOwned && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full">
                  👀 Preview
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Memory Info"
              >
                <Info className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={resetCamera}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Reset View"
              >
                <RotateCcw className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={() => {
                  if (containerRef.current) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen()
                    } else {
                      containerRef.current.requestFullscreen()
                    }
                  }
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-20 left-4 w-80 glass rounded-xl p-6 z-10"
          >
            <h3 className="text-lg font-semibold mb-2 text-white">Memory Details</h3>
            <p className="text-gray-300 text-sm mb-4">{memoryDescription}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Scene URL:</span>
                <span className="text-white font-mono text-xs truncate ml-2">
                  {lumaUrl ? lumaUrl.slice(-20) + '...' : 'Default scene'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Access:</span>
                <span className={isOwned ? "text-green-400" : "text-orange-400"}>
                  {isOwned ? "Full Access" : "Preview Only"}
                </span>
              </div>
            </div>

            {!isOwned && (
              <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <p className="text-orange-400 text-xs">
                  💡 Own this NFT to unlock full 3D interaction, HD quality, and AI chat features
                </p>
              </div>
            )}

            {isOwned && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-xs">
                  🎉 You own this memory! Enjoy full access to all features
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
              <p className="text-white mb-2">Loading 3D Memory...</p>
              <p className="text-gray-400 text-sm">Initializing Gaussian splat renderer</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass rounded-xl p-8 text-center max-w-md">
              <p className="text-red-400 mb-4">{error}</p>
              <p className="text-gray-400 text-sm mb-4">
                This might be due to browser compatibility or network issues.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3D Canvas */}
        <div 
          ref={containerRef}
          className="w-full h-full pt-20"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: isLoading || error ? 'none' : 'block' }}
          />
        </div>

        {/* Controls Hint */}
        {!isLoading && !error && (
          <div className="absolute bottom-4 left-4 glass rounded-lg p-3">
            <p className="text-white text-sm">
              🖱️ Drag to rotate • 🔍 Scroll to zoom • 📱 Touch to interact
            </p>
          </div>
        )}

        {/* Ownership Notice */}
        {!isOwned && !isLoading && !error && (
          <div className="absolute bottom-4 right-4 glass rounded-lg p-4 max-w-sm">
            <p className="text-orange-400 text-sm mb-2">🔒 Preview Mode</p>
            <p className="text-gray-300 text-xs">
              You're viewing a preview. Own this memory NFT to unlock full HD quality, 
              enhanced interactions, and AI-powered memory chat.
            </p>
          </div>
        )}

        {/* Ownership Benefits */}
        {isOwned && !isLoading && !error && (
          <div className="absolute bottom-4 right-4 glass rounded-lg p-4 max-w-sm">
            <p className="text-green-400 text-sm mb-2">✨ Owner Benefits</p>
            <p className="text-gray-300 text-xs">
              Full HD quality • Enhanced controls • AI memory chat • Download rights
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 