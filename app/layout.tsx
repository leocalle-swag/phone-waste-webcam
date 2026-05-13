import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PHONE WASTE — TE-01',
  description: 'Personal device consumption audit tool',
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
