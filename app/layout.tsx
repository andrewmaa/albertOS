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
        <title>AlbertOS - NYU Student Information System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ConvexProvider client={convex}>
          {children}
          <Toaster />
        </ConvexProvider>
      </body>
    </html>
  )
}

