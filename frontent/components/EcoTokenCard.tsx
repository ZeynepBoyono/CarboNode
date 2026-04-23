'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatUnits }                 from 'viem'
import { ADDRESSES, ecoTokenAbi }      from '@/lib/contracts'

export function EcoTokenCard() {
  const { address } = useAccount()

  const { data: balance, isLoading: loadingBalance } = useReadContract({
    address: ADDRESSES.EcoToken,
    abi:     ecoTokenAbi,
    functionName: 'balanceOf',
    args:    [address!],
    query:   { enabled: !!address },
  })

  const { data: totalSupply } = useReadContract({
    address: ADDRESSES.EcoToken,
    abi:     ecoTokenAbi,
    functionName: 'totalSupply',
    query:   { enabled: true },
  })

  const balanceFormatted     = balance     ? Number(formatUnits(balance, 18)).toLocaleString()     : '—'
  const totalSupplyFormatted = totalSupply ? Number(formatUnits(totalSupply, 18)).toLocaleString() : '—'

  return (
    <div className="bg-[#0b1a0b] border border-green-900/30 rounded-2xl p-6 shadow-glow
                    flex flex-col gap-6">
      {/* Başlık */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-white font-semibold text-sm">EcoToken</span>
        <span className="text-gray-600 text-xs">· ECO</span>
      </div>

      {/* Bakiye */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        {loadingBalance ? (
          <div className="w-6 h-6 border border-green-500/30 border-t-green-400
                          rounded-full animate-spin" />
        ) : (
          <>
            <p className="text-gray-500 text-xs mb-1">Cüzdan Bakiyesi</p>
            <p className="text-5xl font-bold text-green-400 tracking-tight">
              {balanceFormatted}
            </p>
            <p className="text-gray-500 text-sm mt-1">ECO</p>
          </>
        )}
      </div>

      {/* Platform bilgileri */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-[#0e220e] border border-green-900/20 rounded-xl p-3
                        flex items-center justify-between">
          <span className="text-gray-500 text-xs">Platform Toplam Arzı</span>
          <span className="text-white text-sm font-medium">{totalSupplyFormatted} ECO</span>
        </div>

        <div className="bg-[#0e220e] border border-green-900/20 rounded-xl p-3">
          <p className="text-gray-500 text-xs mb-2">Kazanma Yolları</p>
          <div className="flex flex-col gap-1.5">
            <RewardRow action="Geri Dönüşüm"  reward="+10 ECO" color="green" />
            <RewardRow action="Toplu Taşıma"  reward="+5 ECO"  color="cyan" />
            <RewardRow action="Ağaç Dikimi"   reward="+25 ECO" color="emerald" />
            <RewardRow action="Araç Paylaşımı" reward="+8 ECO" color="teal" />
            <RewardRow action="Güneş Enerjisi" reward="+15 ECO" color="yellow" />
          </div>
        </div>
      </div>

      {/* Programmable Money notu */}
      <p className="text-gray-700 text-xs text-center border-t border-green-900/20 pt-4">
        ECO token yalnızca onaylı yeşil işletmelerde harcanabilir.
      </p>
    </div>
  )
}

function RewardRow({
  action, reward, color,
}: {
  action: string
  reward: string
  color: string
}) {
  const colorMap: Record<string, string> = {
    green:   'text-green-400',
    cyan:    'text-cyan-400',
    emerald: 'text-emerald-400',
    teal:    'text-teal-400',
    yellow:  'text-yellow-400',
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 text-xs">{action}</span>
      <span className={`text-xs font-semibold ${colorMap[color] ?? 'text-white'}`}>
        {reward}
      </span>
    </div>
  )
}
