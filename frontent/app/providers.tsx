'use client'

import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { monadTestnet } from '@/lib/monad'
import '@rainbow-me/rainbowkit/styles.css'

const wagmiConfig = getDefaultConfig({
  appName:   'CarboNode',
  projectId: 'carbonode-monad-hackathon',
  chains:    [monadTestnet],
  ssr:       true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor:            '#22c55e',
            accentColorForeground:  'white',
            borderRadius:           'medium',
            overlayBlur:            'small',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
