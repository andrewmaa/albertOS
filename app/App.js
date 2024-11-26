import * as THREE from 'three'
import { useRef, useCallback, useState } from 'react'
import { Canvas, useLoader, useFrame } from '@react-three/fiber'
import { Center, Text3D } from '@react-three/drei'
import { Bloom, EffectComposer, LUT } from '@react-three/postprocessing'
import { LUTCubeLoader } from 'postprocessing'
import { Beam } from './components/Beam'
import { Rainbow } from './components/Rainbow'
import { Prism } from './components/Prism'
import { Flare } from './components/Flare'
import { Box } from './components/Box'

export function lerp(object, prop, goal, speed = 0.1) {
  object[prop] = THREE.MathUtils.lerp(object[prop], goal, speed)
}

const vector = new THREE.Vector3()
export function lerpV3(value, goal, speed = 0.1) {
  value.lerp(vector.set(...goal), speed)
}

export function calculateRefractionAngle(incidentAngle, glassIor = 2.5, airIor = 1.000293) {
  const theta = Math.asin((airIor * Math.sin(incidentAngle)) / glassIor) || 0
  return theta
}

export default function App() {
  const texture = useLoader(LUTCubeLoader, 'https://uploads.codesandbox.io/uploads/user/b3e56831-8b98-4fee-b941-0e27f39883ab/DwlG-F-6800-STD.cube')

  return (
    <Canvas orthographic gl={{ antialias: false }} camera={{ position: [0, 0, 100], zoom: 70 }}>
      <color attach="background" args={['black']} />
      <Scene />
      <EffectComposer disableNormalPass>
        <Bloom mipmapBlur levels={9} intensity={1.5} luminanceThreshold={1} luminanceSmoothing={1} />
        <LUT lut={texture} />
      </EffectComposer>
    </Canvas>
  )
}

function Scene() {
  const [isPrismHit, hitPrism] = useState(false)
  const flare = useRef(null)
  const ambient = useRef(null)
  const spot = useRef(null)
  const boxreflect = useRef(null)
  const rainbow = useRef(null)

  const rayOut = useCallback(() => hitPrism(false), [])
  const rayOver = useCallback((e) => {
    // Break raycast so the ray stops when it touches the prism.
    e.stopPropagation()
    hitPrism(true)
    // Set the intensity really high on first contact.
    rainbow.current.material.speed = 1
    rainbow.current.material.emissiveIntensity = 20
  }, [])

  const vec = new THREE.Vector3()
  const rayMove = useCallback(({ api, position, direction, normal }) => {
    if (!normal) return
    // Extend the line to the prisms center.
    vec.toArray(api.positions, api.number++ * 3)
    // Set flare.
    flare.current.position.set(position.x, position.y, -0.5)
    flare.current.rotation.set(0, 0, -Math.atan2(direction.x, direction.y))

    // Calculate refraction angles.
    let angleScreenCenter = Math.atan2(-position.y, -position.x)
    const normalAngle = Math.atan2(normal.y, normal.x)

    // The angle between the ray and the normal.
    const incidentAngle = angleScreenCenter - normalAngle

    // Calculate the refraction for the incident angle.
    const refractionAngle = calculateRefractionAngle(incidentAngle) * 6

    // Apply the refraction.
    angleScreenCenter += refractionAngle
    rainbow.current.rotation.z = angleScreenCenter

    // Set spot light.
    lerpV3(spot.current.target.position, [Math.cos(angleScreenCenter), Math.sin(angleScreenCenter), 0], 0.05)
    spot.current.target.updateMatrixWorld()
  }, [])

  useFrame((state) => {
    // Tie beam to the mouse.
    boxreflect.current.setRay([(state.pointer.x * state.viewport.width) / 2, (state.pointer.y * state.viewport.height) / 2, 0], [0, 0, 0])

    // Animate rainbow intensity.
    lerp(rainbow.current.material, 'emissiveIntensity', isPrismHit ? 2.5 : 0, 0.1)
    spot.current.intensity = rainbow.current.material.emissiveIntensity

    // Animate ambience.
    lerp(ambient.current, 'intensity', 0, 0.025)
  })

  return (
    <>
      {/* Lights */}
      <ambientLight ref={ambient} intensity={0} />
      <pointLight position={[10, -10, 0]} intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={0.05} />
      <pointLight position={[-10, 0, 0]} intensity={0.05} />
      <spotLight ref={spot} intensity={1} distance={7} angle={1} penumbra={1} position={[0, 0, 1]} />
      {/* Prism + blocks + reflect beam */}
      <Beam ref={boxreflect} bounce={10} far={20}>
        <Prism scale={.6} position={[0, -0.5, 0]} onRayOver={rayOver} onRayOut={rayOut} onRayMove={rayMove} />
      <Box position={[-1.4, 1, 0]} rotation={[0, 0, Math.PI / 8]} />
      <Box position={[-2.4, -1, 0]} rotation={[0, 0, Math.PI / -4]} />
      </Beam>
      {/* Rainbow and flares */}
      <Rainbow ref={rainbow} startRadius={0} endRadius={0.5} fade={0} />
      <Flare ref={flare} visible={isPrismHit} renderOrder={10} scale={1.25} streak={[12.5, 20, 1]} />
    </>
  )
}