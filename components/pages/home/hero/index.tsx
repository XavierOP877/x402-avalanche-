"use client"

/**
 * HeroSection Component
 * 
 * This is the first section users see on the homepage.
 * It uses GSAP (GreenSock Animation Platform) for high-performance entrance animations.
 * 
 * JUNIOR DEV NOTE:
 * - We use `useRef` to target DOM elements for animation without triggering re-renders.
 * - `gsap.context` is crucial in React to strictly scope animations and clean them up
 *   automatically when the component unmounts, preventing memory leaks or double-animations.
 */

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { GlowingBorderBtn } from "@/components/ui/glowing-border-btn"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import VariableProximity from "@/components/ui/VariableProximity"
import { gsap } from "gsap"
import { ArrowRight, Play, LucideIcon } from "lucide-react"

import Link from "next/link"

// Map string keys to actual Icon components to allow dynamic data loading
const ICON_MAP: Record<string, LucideIcon> = {
  ArrowRight,
  Play,
}

interface HeroSectionProps {
  data: {
    badge: string
    title: string
    subtitle: string
    description: string
    ctaPrimary: {
      text: string
      icon: string
      href?: string
    }
    ctaSecondary: {
      text: string
      icon: string
    }
    stats: Array<{
      value: string
      label: string
    }>
  }
}

export function HeroSection({ data }: HeroSectionProps) {
  // Refs for animation targets
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // GSAP Context: Scopes all selectors to `containerRef` and handles cleanup
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } })

      // Animate elements in sequence
      timeline
        .fromTo(titleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 })
        .fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
    }, containerRef)

    // Cleanup function called when component unmounts
    return () => ctx.revert()
  }, [])

  const PrimaryIcon = ICON_MAP[data.ctaPrimary.icon] || ArrowRight
  const SecondaryIcon = ICON_MAP[data.ctaSecondary.icon] || Play

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Shader Effect - Keeps the main thread free by using WebGL */}
      <WebGLShader />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-20">
        <div className="relative border border-[#27272a] p-2 w-full mx-auto max-w-3xl z-10 bg-black/40 backdrop-blur-sm rounded-xl">
          <main className="relative border border-[#27272a] py-8 md:py-12 overflow-hidden rounded-lg flex flex-col items-center text-center">
            
            {/* Animated Badge */}
            {data.badge && (
              <div className="my-8 flex items-center justify-center gap-2 mb-8">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-blue opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-blue"></span>
                  </span>
                  <p className="text-xs md:text-sm text-neon-blue font-mono uppercase tracking-wider">{data.badge}</p>
              </div>
            )}

            {/* Main Title with Hover Effect */}
            <h1 ref={titleRef} className="mb-4 text-white text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-none">
              <span className="inline-block transition-all duration-300 hover:drop-shadow-[0_0_35px_rgba(255,255,255,0.8)] cursor-default">
                {data.title}
              </span>
            </h1>

            <div 
              ref={subtitleRef} 
              className="relative mb-8 max-w-2xl mx-auto"
              style={{ cursor: 'pointer' }}
            >
              <VariableProximity
                label={data.description as string}
                className="text-lg font-light text-white/60 md:text-xl font-sans leading-relaxed text-center block"
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 900, 'opsz' 40"
                containerRef={subtitleRef}
                radius={100}
                falloff="linear"
              />
            </div>
            
            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full z-20 pointer-events-auto"> 
                <Link href={data.ctaPrimary.href || "/demo"}>
                  <GlowingBorderBtn>
                    {data.ctaPrimary.text}
                  </GlowingBorderBtn>
                </Link>
                
                <Button variant="ghost" className="rounded-full bg-white/5 backdrop-blur-sm border border-white/10 gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 h-auto py-3 px-6 text-sm font-medium">
                  <SecondaryIcon className="w-4 h-4" />
                  {data.ctaSecondary.text}
                </Button>
            </div> 

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-8 pt-8 w-full max-w-lg mx-auto border-t border-white/5 mt-8">
              {data.stats.map((stat, index) => (
                <div key={index} className="space-y-0.5">
                  <div className="text-lg md:text-xl font-bold text-white/90">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider text-white/40 font-mono">{stat.label}</div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}
