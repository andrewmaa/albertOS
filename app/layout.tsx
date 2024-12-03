'use client'

import './globals.css'
import { Toaster } from 'sonner';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <title>AlbertOS - NYU Student Information System</title>
      </head>
      <body>
        <ConvexProvider client={convex}>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 relative">
              {children}
            </main>
            <footer className="z-10 w-full py-4 px-6 bg-black/30 backdrop-blur-sm text-center text-white/80">
              <p className="text-sm">
                Made with{' '}
                <span className="text-red-500 animate-pulse" aria-label="love">
                  ❤️
                </span>
                {' '}by{' '}
                <a 
                  href="https://andrewma.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-white hover:text-purple-400 transition-colors
                    relative after:absolute after:bottom-0 after:left-0 after:h-[1px] 
                    after:w-0 hover:after:w-full after:bg-purple-400 after:transition-all"
                >
                  Andrew Ma
                </a>
              </p>
            </footer>
          </div>
          <Toaster />
        </ConvexProvider>
      </body>
    </html>
  )
}

