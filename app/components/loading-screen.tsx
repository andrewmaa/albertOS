'use client'

import { useEffect, useState } from 'react'
import anime from 'animejs'

export default function LoadingScreen({ onLoadComplete }: { onLoadComplete: () => void }) {
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    // Animate the logo
    anime({
      targets: '#loading-logo',
      scale: [0.5, 1],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 1000
    })

    // Animate the spinning ring
    anime({
      targets: '#loading-ring',
      rotate: 360,
      easing: 'linear',
      duration: 2000,
      loop: true
    })

    // Create animated background dots
    const dots = Array.from({ length: 20 }).map((_, i) => {
      const dot = document.createElement('div')
      dot.className = 'absolute w-2 h-2 rounded-full bg-purple-500/30'
      dot.style.left = `${Math.random() * 100}vw`
      dot.style.top = `${Math.random() * 100}vh`
      document.getElementById('loading-background')?.appendChild(dot)

      // Animate each dot
      anime({
        targets: dot,
        translateX: anime.random(-50, 50),
        translateY: anime.random(-50, 50),
        scale: [0, 1],
        opacity: [0, 0.5, 0],
        easing: 'easeOutExpo',
        duration: 3000,
        delay: i * 100,
        loop: true
      })

      return dot
    })

    // Start fade out after 1.5 seconds
    const timer = setTimeout(() => {
      setOpacity(0)
      setTimeout(onLoadComplete, 500) // Call completion after fade animation
    }, 1500)

    // Cleanup
    return () => {
      clearTimeout(timer)
      dots.forEach(dot => dot.remove())
    }
  }, [onLoadComplete])

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      style={{ 
        opacity, 
        transition: 'opacity 0.5s ease-out'
      }}
    >
      <div id="loading-background" className="absolute inset-0 overflow-hidden" />
      <div 
        id="loading-logo"
        className="relative flex items-center justify-center opacity-0"
      >
        {/* Spinning ring */}
        <div 
          id="loading-ring"
          className="absolute w-24 h-24 rounded-full border-2 border-transparent
            border-t-purple-500 border-r-pink-500"
          style={{ transform: 'rotate(0deg)' }}
        />
        
        {/* Logo container */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
          flex items-center justify-center shadow-lg">
          <img src="../logo-icon.svg" alt="AlbertOS Logo" className="w-8 h-8" />
        </div>
      </div>
    </div>
  )
} 