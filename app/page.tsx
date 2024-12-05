'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import Typed from 'typed.js'
import LoadingScreen from './components/loading-screen'

const Background = dynamic(() => import('@/app/components/gradient-background'), { ssr: false })

export default function LandingPage() {
  const router = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement>(null)
  const typedRef = useRef<HTMLSpanElement>(null)
  const typed = useRef<Typed | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Scroll to top on page load/refresh
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Use 'instant' instead of 'smooth' to prevent animation on refresh
      });
    }
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    // Add cursor style
    const style = document.createElement('style')
    style.textContent = `
      .typed-cursor {
        font-size: 0.8em;
        vertical-align: middle;
        opacity: 1;
        margin-left: 0.1em;
      }
    `
    document.head.appendChild(style)

    // Initialize Typed.js
    if (typedRef.current) {
      typed.current = new Typed(typedRef.current, {
        strings: [
          'courses.',
          'schedule.',
          'finances.',
          'academic journey.',
          'career.',
          'student life.'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '&#11044;',
      })
    }

    // Cleanup
    return () => {
      if (typed.current) {
        typed.current.destroy()
      }
      style.remove()
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      // Fade in navigation
      anime({
        targets: navRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 800,
        easing: 'easeOutCubic',
        delay: 200
      })

      // Fade in header content
      anime({
        targets: headerRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1000,
        easing: 'easeOutCubic',
        delay: 400
      })

      // Create intersection observer for scroll animations with adjusted settings
      const observerOptions = {
        root: null,
        rootMargin: '-10%',
        threshold: 0.2
      }

      // Keep track of animated elements
      const animatedElements = new Set()

      const observerCallback: IntersectionObserverCallback = (entries) => {
        entries.forEach(entry => {
          const element = entry.target as HTMLDivElement

          if (entry.isIntersecting && !animatedElements.has(element)) {
            animatedElements.add(element)
            
            anime({
              targets: element,
              opacity: [0, 1],
              translateY: [50, 0],
              duration: 800,
              easing: 'easeOutCubic',
              begin: () => {
                if (element instanceof HTMLElement) {
                  element.style.opacity = '0'
                }
              },
              complete: () => {
                if (element instanceof HTMLElement) {
                  element.style.transform = 'translateY(0)'
                  element.style.opacity = '1'
                }
              }
            })
          }
        })
      }

      const observer = new IntersectionObserver(observerCallback, observerOptions)

      // Properly type the elements when selecting them
      document.querySelectorAll<HTMLDivElement>('.scroll-fade').forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.opacity = '0'
          element.style.transform = 'translateY(50px)'
          observer.observe(element)
        }
      })

      return () => {
        observer.disconnect()
        animatedElements.clear()
      }
    }
  }, [isLoading])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const href = e.currentTarget.getAttribute('href')
    if (!href) return

    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)
    if (!element) return

    const navHeight = navRef.current?.offsetHeight || 0
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - (navHeight + 20)

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }

  // Helper function to create fade-in sections
  const FadeSection = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`scroll-fade opacity-0 ${className}`}>
      {children}
    </div>
  )

  return (
    <>
      {isLoading && <LoadingScreen onLoadComplete={() => setIsLoading(false)} />}
      <div className="min-h-screen" style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease-out' }}>
        {/* Updated Fixed navigation with better centering */}
        <div 
          ref={navRef} 
          className="fixed top-4 left-0 right-0 z-50 mx-auto w-[90%] max-w-6xl"
          style={{ opacity: 0 }}
        >
          <nav className="bg-black/20 backdrop-blur-md rounded-full px-6 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {/* Logo */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <img src="../logo-icon.svg" alt="AlbertOS Logo"/>
                </div>
                <span className="text-white font-bold text-xl">AlbertOS</span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex space-x-8">
                {['About', 'Features', 'Why AlbertOS?', 'How It Works', 'Development'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={handleNavClick}
                    className="text-gray-200 hover:text-white transition-colors cursor-pointer"
                  >
                    {item}
                  </a>
                ))}
              </div>

              {/* Get Started Button */}
              <button
                onClick={() => router.push('/login')}
                className="bg-black/30 hover:bg-black/40 text-white px-6 py-2 rounded-full 
                  transition-colors duration-200 backdrop-blur-sm"
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>

        {/* Background */}
        <div 
          className="fixed inset-0 -z-10"
          style={{ 
            opacity: isLoading ? 0 : 1, 
            transition: 'opacity 1s ease-out',
            pointerEvents: isLoading ? 'none' : 'auto' // This ensures cursor events work after loading
          }}
        >
          <Background />
        </div>

        {/* Hero section with Typed.js */}
        <div className="min-h-screen flex items-center justify-center px-4">
          <div 
            ref={headerRef}
            className="text-center max-w-3xl mx-auto"
            style={{ opacity: 0 }}
          >
            <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Welcome to AlbertOS.
            </h1>
            <div className="text-3xl text-white mb-8 drop-shadow-lg">
              <span className="inline-flex">
                Plan your 
                <span 
                  ref={typedRef}
                  className="text-white font-bold ml-2"
                  style={{ 
                    whiteSpace: 'pre',
                  }}
                />
              </span>
            </div>
            <p className="text-gray-200 text-lg mb-8">
              AlbertOS is a modern reimagining of NYU's Albert system, designed to provide students 
              with a seamless and intuitive course registration experience.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg text-lg font-medium
                hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Content sections with fade effects */}
        <div ref={sectionsRef} className="relative z-10 bg-black/30 backdrop-blur-lg">
          {/* About Section */}
          <section id="about" className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <FadeSection>
                <h2 className="text-4xl font-bold text-white mb-6">About AlbertOS</h2>
                <p className="text-gray-200 text-lg leading-relaxed mb-6">
                  AlbertOS is a modern reimagining of NYU's Albert system, designed to provide students 
                  with a seamless and intuitive course registration experience. Built with the latest 
                  web technologies, it offers a fresh perspective on academic planning and management.
                </p>
              </FadeSection>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-6 bg-white/5">
            <div className="max-w-4xl mx-auto">
              <FadeSection>
                <h2 className="text-4xl font-bold text-white mb-6">Features</h2>
              </FadeSection>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: 'Intuitive Course Search',
                    description: 'Find your courses easily with our smart search system.'
                  },
                  {
                    title: 'Real-time Validation',
                    description: 'Get instant feedback on schedule conflicts and prerequisites.'
                  },
                  {
                    title: 'Modern Interface',
                    description: 'Clean, responsive design that works on any device.'
                  },
                  {
                    title: 'Smart Recommendations',
                    description: 'Get personalized course suggestions based on your academic path.'
                  }
                ].map((feature) => (
                  <FadeSection key={feature.title}>
                    <div 
                      className="bg-white/10 p-6 rounded-lg relative group overflow-hidden
                        transition-all duration-300 hover:scale-[1.02]"
                    >
                      {/* Gradient overlay that appears on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 
                        group-hover:from-purple-500/10 group-hover:to-pink-500/10
                        transition-all duration-300 ease-out -z-0" 
                      />
                      
                      {/* Card content */}
                      <div className="relative z-10">
                        <h3 className="text-xl font-semibold text-white mb-2 
                          group-hover:text-white transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </FadeSection>
                ))}
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section id="why-albertos" className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <FadeSection>
                <h2 className="text-4xl font-bold text-white mb-6">Why AlbertOS?</h2>
                <p className="text-gray-200 text-lg leading-relaxed mb-12">
                  While NYU offers an exceptional range of academic opportunities as one of America's largest private universities,
                  the current Albert system struggles to provide a seamless registration experience for our diverse student body.
                  With over 53,000 students across 230 areas of study, we need a modern platform that can efficiently serve our
                  growing academic community.
                </p>
              </FadeSection>
              
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    number: 230,
                    label: 'Areas of Study',
                    description: 'Across undergraduate and graduate programs'
                  },
                  {
                    number: 53000,
                    label: 'Students',
                    description: 'From all 50 states and 133 countries'
                  },
                  {
                    number: 19,
                    label: 'Schools and Colleges',
                    description: 'Each with unique opportunities'
                  }
                ].map((stat) => (
                  <FadeSection key={stat.label}>
                    <div className="bg-white/10 p-6 rounded-lg relative group overflow-hidden
                      transition-all duration-300 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 
                        group-hover:from-purple-500/10 group-hover:to-pink-500/10
                        transition-all duration-300 ease-out -z-0" />
                      <div className="relative z-10">
                        <div className="text-4xl font-bold text-white mb-2" 
                          data-value={stat.number}
                          ref={(el) => {
                            if (el) {
                              const observer = new IntersectionObserver((entries) => {
                                entries.forEach((entry) => {
                                  if (entry.isIntersecting) {
                                    const target = entry.target;
                                    const value = parseInt(target.getAttribute('data-value') || '0');
                                    let current = 0;
                                    const increment = value / 50; // Adjust speed here
                                    const timer = setInterval(() => {
                                      current += increment;
                                      if (current >= value) {
                                        target.textContent = value.toLocaleString();
                                        clearInterval(timer);
                                      } else {
                                        target.textContent = Math.floor(current).toLocaleString();
                                      }
                                    }, 20);
                                    observer.disconnect();
                                  }
                                });
                              }, { threshold: 0.5 });
                              observer.observe(el);
                            }
                          }}
                        >
                          0
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {stat.label}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                    
                  </FadeSection>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <FadeSection>
                <h2 className="text-4xl font-bold text-white mb-6">How It Works</h2>
              </FadeSection>
              <div className="space-y-8">
                {[
                  {
                    step: '1',
                    title: 'Search Courses',
                    description: 'Enter your desired subject code or course name to browse available classes.'
                  },
                  {
                    step: '2',
                    title: 'Build Your Schedule',
                    description: 'Add courses to your cart and see them visualized in a weekly calendar view.'
                  },
                  {
                    step: '3',
                    title: 'Validate & Enroll',
                    description: 'Confirm your schedule has no conflicts and complete your registration.'
                  }
                ].map((step) => (
                  <FadeSection key={step.step} className="flex gap-6 items-start">
                    <div className="w-12 h-12 flex-shrink-0 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{step.step}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-gray-300">{step.description}</p>
                    </div>
                  </FadeSection>
                ))}
              </div>
            </div>
          </section>

          {/* Development Section */}
          <section id="development" className="py-20 px-6 bg-white/5">
            <div className="max-w-4xl mx-auto">
              <FadeSection>
                <h2 className="text-4xl font-bold text-white mb-6">Development</h2>
                <p className="text-gray-200 text-lg leading-relaxed">
                  AlbertOS was created by Andrew Ma, a sophomore at NYU. Using modern web technologies including Next.js, 
                  Tailwind CSS, and Convex, the purpose of this project is to provide a more intuitive and efficient 
                  way to manage an NYU student's academic journey.

                  <br />
                  <br />

                  Thank you to the team @ BUGS for providing{' '}
                  <a 
                    href="https://github.com/bugs-nyu/schedge/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white hover:text-purple-400 transition-colors
                      relative after:absolute after:bottom-0 after:left-0 after:h-[1px] 
                      after:w-0 hover:after:w-full after:bg-purple-400 after:transition-all"
                  >
                    Schedge
                  </a>
                  , the API that made this possible.
                  <br />
                  <a 
                    href="https://andrewma.io/albertos" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white hover:text-purple-400 transition-colors
                      relative after:absolute after:bottom-0 after:left-0 after:h-[1px] 
                      after:w-0 hover:after:w-full after:bg-purple-400 after:transition-all"
                  >
                    You can learn more about the development of this project here
                  </a>.
                </p>
              </FadeSection>
            </div>
          </section>
        </div>
      </div>
    </>
  )
} 