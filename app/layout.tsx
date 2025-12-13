import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/Providers"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Fascinet - Distributed Facilitator Network",
  description: "The infrastructure layer for the autonomous agent economy.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

import HeroAsciiWrapper from "@/components/ui/hero-ascii-one"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <div className="relative min-h-screen flex flex-col">
              <div className="fixed inset-0 w-full h-full stars-bg z-0 pointer-events-none"></div>
              <HeroAsciiWrapper>
                {children}
              </HeroAsciiWrapper>
            </div>
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
