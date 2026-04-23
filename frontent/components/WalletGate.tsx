'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20
                        flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="7" width="20" height="14" rx="2" stroke="#22c55e" strokeWidth="1.5"/>
            <path d="M16 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="#22c55e"/>
            <path d="M6 7V5a6 6 0 0 1 12 0v2" stroke="#22c55e" strokeWidth="1.5"
                  strokeLinecap="round"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-1">Cüzdanını Bağla</p>
          <p className="text-gray-500 text-sm">
            EcoProfile ve ECO Token bakiyeni görmek için MetaMask ile bağlan.
          </p>
        </div>
        <ConnectButton />
      </div>
    )
  }

  return <>{children}</>
}
