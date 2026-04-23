'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function Header() {
  return (
    <header className="border-b border-green-900/30 bg-[#050e05]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30
                          flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="#22c55e" opacity="0.2"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10
                       c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                    fill="#22c55e"/>
              <circle cx="12" cy="12" r="2" fill="#22c55e"/>
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">CarboNode</span>
            <span className="hidden sm:inline text-gray-500 text-xs ml-2">ReFi Carbon Tracker</span>
          </div>
        </div>

        {/* Wallet Connect */}
        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="address"
        />
      </div>
    </header>
  )
}
