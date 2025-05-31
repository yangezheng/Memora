'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, RotateCcw, Info, MessageCircle } from 'lucide-react'
import VoiceAI from './VoiceAI'

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
  const [showAI, setShowAI] = useState(false)
  const sceneRef = useRef<any>(null)

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    let renderer: any
    let scene: any
    let camera: any
    let controls: any
    let splat: any
    let animationId: number

    const initializeScene = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const canvas = canvasRef.current!

        // Step 1: Inject importmap exactly like the HTML file (if not already present)
        if (!document.querySelector('script[type="importmap"]')) {
          const importMapScript = document.createElement('script')
          importMapScript.type = 'importmap'
          importMapScript.textContent = JSON.stringify({
            "imports": {
              "three": "https://unpkg.com/three@0.157.0/build/three.module.js",
              "three/addons/": "https://unpkg.com/three@0.157.0/examples/jsm/",
              "@lumaai/luma-web": "https://unpkg.com/@lumaai/luma-web@0.2.0/dist/library/luma-web.module.js"
            }
          })
          document.head.appendChild(importMapScript)
          
          // Wait for importmap to be processed
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // Step 2: Load everything in a single module script (like the HTML file)
        await new Promise<void>((resolve, reject) => {
          if ((window as any).memoraSceneReady) {
            resolve()
            return
          }

          const script = document.createElement('script')
          script.type = 'module'
          script.textContent = `
            import { WebGLRenderer, PerspectiveCamera, Scene, Color } from 'three';
            import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
            import { LumaSplatsThree } from '@lumaai/luma-web';
            
            // Store globals for React component access
            window.MemoraTHREE = { WebGLRenderer, PerspectiveCamera, Scene, Color, OrbitControls };
            window.MemoraLumaSplatsThree = LumaSplatsThree;
            window.memoraSceneReady = true;
            window.dispatchEvent(new CustomEvent('memora-modules-loaded'));
          `
          
          const onLoad = () => {
            console.log('✅ All modules loaded successfully')
            resolve()
          }
          
          const onError = (error: any) => {
            console.error('❌ Module loading failed:', error)
            reject(new Error('Failed to load 3D modules'))
          }

          window.addEventListener('memora-modules-loaded', onLoad, { once: true })
          script.onerror = onError
          
          document.head.appendChild(script)
          
          // Timeout after 10 seconds
          setTimeout(() => {
            window.removeEventListener('memora-modules-loaded', onLoad)
            reject(new Error('Module loading timeout'))
          }, 10000)
        })

        // Step 3: Use the loaded modules to create the scene (exactly like HTML)
        const THREE = (window as any).MemoraTHREE
        const LumaSplatsThree = (window as any).MemoraLumaSplatsThree

        if (!THREE || !LumaSplatsThree) {
          throw new Error('Modules not loaded properly')
        }

        console.log('✅ Using Luma URL:', lumaUrl)
        console.log('✅ LumaSplatsThree available:', !!LumaSplatsThree)

        // Set up WebGL renderer
        renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: false
        })

        renderer.setSize(window.innerWidth, window.innerHeight, false)

        scene = new THREE.Scene()
        renderer.setClearColor(new THREE.Color(0xffd1a4).convertLinearToSRGB())

        // Set scene background without fog to avoid shader conflicts
        scene.background = new THREE.Color(0xffd1a4).convertLinearToSRGB()

        // Set up camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = -1.0
        camera.position.y = 1.5
        camera.position.x = 0.9

        // Set up controls
        controls = new THREE.OrbitControls(camera, canvas)
        controls.enableDamping = true

        // Create LumaSplats object
        const splatUrl = lumaUrl || 'https://lumalabs.ai/capture/089bc8d0-23e0-4ef7-8a72-d028d0dd86ab'
        console.log('🎯 Creating LumaSplats with URL:', splatUrl)
        
        try {
          splat = new LumaSplatsThree({
            source: splatUrl,
            // Add options to minimize shader conflicts
            particleRevealEnabled: false
          })

          scene.add(splat)
          console.log('✅ LumaSplats added to scene')
          
          // Wait for splat to be ready before starting animation
          await new Promise(resolve => {
            if (splat.ready) {
              resolve(true)
            } else {
              splat.addEventListener('ready', () => resolve(true))
            }
            // Timeout after 5 seconds
            setTimeout(() => resolve(true), 5000)
          })
          
        } catch (splatError) {
          console.warn('LumaSplats creation failed, using basic scene:', splatError)
          
          // Add a simple placeholder instead
          const geometry = new THREE.SphereGeometry(0.5, 32, 32)
          const material = new THREE.MeshBasicMaterial({ 
            color: 0xffd1a4,
            transparent: true,
            opacity: 0.8
          })
          splat = new THREE.Mesh(geometry, material)
          scene.add(splat)
        }

        sceneRef.current = { renderer, scene, camera, controls, splat }

        // Animation loop with WebGL state management
        const animate = () => {
          animationId = requestAnimationFrame(animate)
          
          try {
            controls.update()
            
            // Clear any potential WebGL errors before rendering
            const gl = renderer.getContext()
            while (gl.getError() !== gl.NO_ERROR) {
              // Clear previous errors
            }
            
            // Force WebGL state reset to avoid program conflicts
            renderer.state.reset()
            
            renderer.render(scene, camera)
            
            // Check for WebGL errors after rendering and handle them silently
            const error = gl.getError()
            if (error !== gl.NO_ERROR && error !== gl.INVALID_OPERATION) {
              console.warn('WebGL error (non-critical):', error)
            }
          } catch (renderError) {
            console.warn('Render error (continuing):', renderError)
          }
        }

        animate()
        console.log('✅ 3D Gaussian splat scene loaded successfully!')
        setIsLoading(false)

      } catch (err) {
        console.error('❌ Failed to load 3D scene:', err)
        
        // Fallback to simple Three.js scene
        try {
          const THREE = await import('three')
          const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
          
          const canvas = canvasRef.current!
          
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
          const material = new THREE.MeshPhongMaterial({ 
            color: isOwned ? 0x00ff00 : 0xff6600,
            wireframe: true 
          })
          const sphere = new THREE.Mesh(geometry, material)
          scene.add(sphere)

          // Add lighting
          const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
          scene.add(ambientLight)
          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
          directionalLight.position.set(1, 1, 1)
          scene.add(directionalLight)

          const animate = () => {
            animationId = requestAnimationFrame(animate)
            controls.update()
            sphere.rotation.y += 0.005
            renderer.render(scene, camera)
          }

          animate()
          setError('Using fallback 3D scene. LumaSplats failed to load.')
          setIsLoading(false)
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr)
          setError('Failed to load 3D scene. Please try again.')
          setIsLoading(false)
        }
      }
    }

    initializeScene()

    // Handle resize
    const handleResize = () => {
      if (sceneRef.current && canvasRef.current) {
        const { camera, renderer } = sceneRef.current
        const canvas = canvasRef.current
        
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
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
  }, [isOpen, lumaUrl, isOwned])

  const resetCamera = () => {
    if (sceneRef.current) {
      const { camera, controls } = sceneRef.current
      camera.position.set(0.9, 1.5, -1.0)
      if (controls && controls.reset) {
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
        ref={containerRef}
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
                onClick={() => setShowAI(!showAI)}
                className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${
                  showAI ? 'bg-blue-500/20 text-blue-400' : ''
                }`}
                title="Voice AI Assistant"
              >
                <MessageCircle className="h-5 w-5 text-white" />
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

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-white">Loading 3D scene...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

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
              <div className="flex justify-between">
                <span className="text-gray-400">Renderer:</span>
                <span className="text-blue-400 text-xs">
                  {error ? 'Fallback' : 'LumaSplats'}
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
      </div>

      {/* Voice AI Assistant */}
      <VoiceAI
        memoryName={memoryName}
        memoryDescription={memoryDescription}
        isOwned={isOwned}
        isActive={showAI}
        onToggle={() => setShowAI(false)}
      />
    </motion.div>
  )
} 