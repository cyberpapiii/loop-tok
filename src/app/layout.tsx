import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  weight: ['400', '700'],
  subsets: ['latin']
})

export const metadata = {
  title: 'LOOP TikTok Tool',
  description: 'Tool for TikTok / OBS polls',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
