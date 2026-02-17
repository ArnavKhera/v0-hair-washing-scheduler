import type { Metadata, Viewport } from 'next'
import { Nunito, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" });

export const metadata: Metadata = {
  title: 'Hair Washing Scheduler',
  description: 'Plan your hair wash days around weather, events, and your ideal curl timeline.',
}

export const viewport: Viewport = {
  themeColor: '#faf5f0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${spaceMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
