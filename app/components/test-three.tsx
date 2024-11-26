'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import type { Mesh } from 'three'

function Box() {
  const meshRef = useRef<Mesh>(null)
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial color="purple" />
    </mesh>
  )
}

export default function TestThree() {
  return (
    <div className="h-[400px] w-full bg-gray-100 rounded-lg">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box />
        <OrbitControls />
      </Canvas>
    </div>
  )
} 