'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'

export default function SphereBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return

    // Setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Create sphere with more segments for smoother deformation
    const geometry = new THREE.SphereGeometry(5, 256, 256)
    const material = new THREE.MeshPhongMaterial({
      color: 0x4c1d95,
      shininess: 80,
      specular: 0x666666,
      emissive: 0x2a0f52,
      emissiveIntensity: 0.3,
    })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Lighting setup for organic look
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8)
    light1.position.set(5, 5, 5)
    scene.add(light1)
    
    const light2 = new THREE.DirectionalLight(0x8844ff, 0.5)
    light2.position.set(-5, -5, -5)
    scene.add(light2)
    
    const ambientLight = new THREE.AmbientLight(0x666666, 0.5)
    scene.add(ambientLight)

    camera.position.z = 10

    // Setup noise
    const noise = new SimplexNoise()
    let time = 0
    
    // Store original vertex positions
    const positionAttribute = geometry.getAttribute('position')
    const originalPositions = new Float32Array(positionAttribute.array.length)
    originalPositions.set(positionAttribute.array)

    // Mouse interaction
    let mouseX = 0
    let mouseY = 0
    const mouseSensitivity = 0.0005

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2)
      mouseY = (event.clientY - window.innerHeight / 2)
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.001

      // Update vertices with organic movement
      const positions = positionAttribute.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        const originalX = originalPositions[i]
        const originalY = originalPositions[i + 1]
        const originalZ = originalPositions[i + 2]

        // Calculate distance from mouse
        const mouseDistance = Math.sqrt(
          Math.pow((originalX - mouseX * mouseSensitivity), 2) +
          Math.pow((originalY + mouseY * mouseSensitivity), 2)
        )

        // Create organic movement with multiple noise layers
        const noiseValue1 = noise.noise3d(
          originalX * 0.2 + time,
          originalY * 0.2 + time,
          originalZ * 0.2
        )
        
        const noiseValue2 = noise.noise3d(
          originalX * 0.4 + time * 1.5,
          originalY * 0.4 + time * 1.5,
          originalZ * 0.4
        ) * 0.5

        // Combine noise layers with mouse influence
        const displacement = 
          (noiseValue1 * 0.3 + noiseValue2 * 0.2) + 
          Math.max(0, 0.3 - mouseDistance * 0.15)

        positions[i] = originalX * (1 + displacement)
        positions[i + 1] = originalY * (1 + displacement)
        positions[i + 2] = originalZ * (1 + displacement)
      }

      positionAttribute.needsUpdate = true
      
      // Smooth rotation
      sphere.rotation.y += 0.001
      sphere.rotation.x += 0.0005

      renderer.render(scene, camera)
    }

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0" />
} 