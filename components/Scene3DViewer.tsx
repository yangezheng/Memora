'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Maximize2, RotateCcw, Info } from 'lucide-react'

interface Scene3DViewerProps {
  isOpen: boolean
  onClose: () => void
  sceneUrl: string
  memoryName: string
  memoryDescription: string
  isOwned: boolean
}

export default function Scene3DViewer({ 
  isOpen, 
  onClose, 
  sceneUrl, 
  memoryName, 
  memoryDescription,
  isOwned 
}: Scene3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<any>(null)
  const controlsRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    let renderer: any
    let scene: any
    let camera: any
    let controls: any
    let splat: any
    let animationId: number

    const initScene = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Dynamically import Three.js modules
        const THREE = await import('three')
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
        
        // For now, we'll use a placeholder until we can properly load LumaSplatsThree
        // In production, you'd load this from the CDN or install the package
        
        const canvas = canvasRef.current!
        
        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: true,
          alpha: true
        })

        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
        renderer.setClearColor(new THREE.Color(0x000000), 0)

        scene = new THREE.Scene()
        
        // Set up fog and background similar to your HTML
        const fogColor = new THREE.Color(0xffd1a4)
        scene.fog = new THREE.FogExp2(fogColor, 0.18)
        scene.background = fogColor

        camera = new THREE.PerspectiveCamera(
          75, 
          canvas.clientWidth / canvas.clientHeight, 
          0.1, 
          1000
        )
        camera.position.set(0.9, 1.5, -1.0)
        cameraRef.current = camera

        controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controlsRef.current = controls

        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ 
          color: 0x00ff00,
          wireframe: true 
        })
        const cube = new THREE.Mesh(geometry, material)
        scene.add(cube)

        // Add some lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
        scene.add(ambientLight)
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(1, 1, 1)
        scene.add(directionalLight)

        // Animation loop
        const animate = () => {
          animationId = requestAnimationFrame(animate)
          controls.update()
          
          // Rotate the cube for demo
          cube.rotation.x += 0.01
          cube.rotation.y += 0.01
          
          renderer.render(scene, camera)
        }

        animate()
        setIsLoading(false)

      } catch (err) {
        console.error('Error initializing 3D scene:', err)
        setError('Failed to load 3D scene')
        setIsLoading(false)
      }
    }

    initScene()

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && renderer && canvasRef.current) {
        const canvas = canvasRef.current
        cameraRef.current.aspect = canvas.clientWidth / canvas.clientHeight
        cameraRef.current.updateProjectionMatrix()
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
      cameraRef.current = null
      controlsRef.current = null
    }
  }, [isOpen, sceneUrl])

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0.9, 1.5, -1.0)
      controlsRef.current.reset()
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
                  Owned
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Info className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={resetCamera}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
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
              >
                <Maximize2 className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                  {sceneUrl.slice(-20)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={isOwned ? "text-green-400" : "text-orange-400"}>
                  {isOwned ? "Full Access" : "Preview Only"}
                </span>
              </div>
            </div>

            {!isOwned && (
              <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <p className="text-orange-400 text-xs">
                  💡 Own this NFT to unlock full 3D interaction and AI chat features
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
              <p className="text-white">Loading your memory...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Close
              </button>
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
              🖱️ Drag to rotate • 🔍 Scroll to zoom • 📱 Pinch to zoom
            </p>
          </div>
        )}

        {/* Ownership Notice */}
        {!isOwned && !isLoading && !error && (
          <div className="absolute bottom-4 right-4 glass rounded-lg p-4 max-w-sm">
            <p className="text-orange-400 text-sm mb-2">Preview Mode</p>
            <p className="text-gray-300 text-xs">
              This is a limited preview. Own the NFT to unlock full features including AI chat and enhanced interactions.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 