"use client"

import { DotScreenShader } from "@/components/ui/dot-shader-background"

export default function ExplorerPage() {
  return (
    <div className="relative min-h-screen py-24">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <DotScreenShader />
      </div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-mono text-white mb-6 uppercase tracking-tight">
          Network Explorer
        </h1>
        <p className="text-xl text-white/50 font-mono">
          Coming Soon...
        </p>
      </div>
    </div>
  )
}
