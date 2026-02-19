import React from "react"
import type { Metadata } from 'next'

import { AuthProvider } from '@/lib/auth-context'
import { WardProvider } from '@/lib/ward-context'
import './globals.css'

import { Comfortaa as V0_Font_Comfortaa, Roboto_Mono as V0_Font_Roboto_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _comfortaa = V0_Font_Comfortaa({ subsets: ['latin'], weight: ["300","400","500","600","700"] })
const _robotoMono = V0_Font_Roboto_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

export const metadata: Metadata = {
  title: 'WaneYen - Nurse Scheduling System',
  description: 'Blessed Schedules for a Better Life - A modern nurse scheduling system',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <WardProvider>{children}</WardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
