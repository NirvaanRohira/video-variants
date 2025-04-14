import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Variant Generator',
  description: 'Create unique video variants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 