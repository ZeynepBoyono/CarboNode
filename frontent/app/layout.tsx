import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title:       'CarboNode | ReFi Carbon Tracker',
  description: 'Monad Network üzerinde çevreci eylemleri ödüllendiren ReFi protokolü.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
