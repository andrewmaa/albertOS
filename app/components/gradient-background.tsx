'use client'

import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function GradientBackground() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const mousePosition = useRef({ x: 0, y: 0 })
  const targetPosition = useRef({ x: 0, y: 0 })
  
  // Get viewport size and update mesh scale
  const { viewport } = useThree()

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.x = viewport.width
      meshRef.current.scale.y = viewport.height
    }
  }, [viewport])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useFrame((state) => {
    if (!materialRef.current) return

    targetPosition.current.x += (mousePosition.current.x - targetPosition.current.x) * 0.05
    targetPosition.current.y += (mousePosition.current.y - targetPosition.current.y) * 0.05

    materialRef.current.uniforms.uMouse.value.set(
      mousePosition.current.x,
      mousePosition.current.y
    )
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * 1.0
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={{
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
        }}
        vertexShader={`
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec2 uMouse;
          uniform vec2 uResolution;
          varying vec2 vUv;

          // Gradient colors
          vec3 color1 = vec3(0.54,0.00,0.88); 
          vec3 color2 = vec3(0.34,0.02,0.55); 
          vec3 color3 = vec3(0.29, 0.07, 0.85); 

          // Noise function
          float noise(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
          }

          void main() {
            vec2 uv = vUv;
            
            // Adjust UV based on resolution aspect ratio
            float aspect = uResolution.x / uResolution.y;
            uv.x *= aspect;
            
            // Create ripple effect
            float ripple1 = sin(length(uv - vec2(aspect * 0.5, 0.5)) * 12.0 - uTime * 1.5) * 0.5 + 0.5;
            float ripple2 = sin(length(uv - vec2(aspect * 0.7, 0.3)) * 10.0 - uTime * 1.8) * 0.5 + 0.5;
            
            // Mouse influence
            vec2 mouseOffset = uv - (uMouse * vec2(aspect, 1.0) * 0.5 + vec2(aspect * 0.5, 0.5));
            float mouseDistance = length(mouseOffset);
            float mouseFactor = smoothstep(0.5, 0.0, mouseDistance);
            
            // Wave distortion
            float wave = sin(uv.x * 12.0 + uTime * 1.5) * cos(uv.y * 10.0 - uTime * 1.5) * 0.02;
            uv += wave;
            
            // Dynamic gradient
            float gradientFactor = length(uv - vec2(aspect * 0.5, 0.5)) + wave + ripple1 * 0.2 + ripple2 * 0.2;
            gradientFactor += mouseFactor * 0.3;
            
            // Color mixing
            vec3 gradient = mix(
              mix(color1, color2, gradientFactor),
              color3,
              sin(gradientFactor * 3.14159 + uTime) * 0.5 + 0.5
            );
            
            // Add shimmer effect
            float shimmer = noise(uv * 100.0 + uTime) * 0.03;
            gradient += shimmer;
            
            // Add glow around mouse
            gradient += vec3(0.2, 0.1, 0.3) * mouseFactor;

            gl_FragColor = vec4(gradient, 1.0);
          }
        `}
      />
    </mesh>
  )
}

export default function Background() {
  return (
    <div className="absolute inset-0 h-full">
      <Canvas 
        camera={{ position: [0, 0, 1] }}
        style={{ position: 'absolute', height: '100%' }}
      >
        <GradientBackground />
      </Canvas>
    </div>
  )
} 