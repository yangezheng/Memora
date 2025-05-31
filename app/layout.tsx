import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Memora - Transform Memories into 3D NFTs',
  description: 'Turn personal memories into on-chain 3D scenes you can own, revisit, and share — all secured with NFTs.',
  keywords: ['NFT', '3D', 'IPFS', 'Ethereum', 'Memories', 'Blockchain'],
  authors: [{ name: 'Memora Team' }],
  themeColor: '#0ea5e9',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 