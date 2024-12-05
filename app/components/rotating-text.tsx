import { useEffect, useRef } from 'react';
import anime from 'animejs';

export function RotatingText() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animation = anime({
      targets: textRef.current,
      rotate: '360deg',
      duration: 20000,
      easing: 'linear',
      loop: true
    });

    return () => animation.pause();
  }, []);

  return (
    <div 
      ref={textRef}
      className="w-full h-full pointer-events-none select-none"
      style={{ transform: 'rotate(0deg)' }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <path
            id="circle"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text fontSize="7.9">
          <textPath href="#circle" className="fill-[#007AFF] uppercase font-[500]">
            Add new class • Add new class • Add new class • 
          </textPath>
        </text>
      </svg>
    </div>
  );
}