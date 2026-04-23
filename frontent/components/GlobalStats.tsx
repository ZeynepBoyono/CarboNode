'use client'

import { useReadContract } from 'wagmi'
import { formatUnits }    from 'viem'
import { ADDRESSES, ecoTrackerCoreAbi } from '@/lib/contracts'

export function GlobalStats() {
  const { data: stats } = useReadContract({
    address: ADDRESSES.EcoTrackerCore,
    abi:     ecoTrackerCoreAbi,
    functionName: 'getGlobalStats',
    query: { refetchInterval: 15_000 },
  })

  const actions = stats ? Number(stats[0]).toLocaleString()                      : '—'
  const tokens  = stats ? Number(formatUnits(stats[1], 18)).toLocaleString()     : '—'
  const credits = stats ? Number(stats[2]).toLocaleString()                      : '—'

  return (
    <div className="max-w-5xl mx-auto px-4 mb-2">
      <div className="grid grid-cols-3 gap-3">
        <StatPill
          label="Toplam Eylem"
          value={actions}
          icon="⚡"
          color="green"
        />
        <StatPill
          label="ECO Basıldı"
          value={tokens}
          icon="🌿"
          color="emerald"
        />
        <StatPill
          label="Karbon Kredisi"
          value={credits}
          icon="🌍"
          color="cyan"
        />
      </div>
    </div>
  )
}

function StatPill({
  label, value, icon, color,
}: {
  label: string
  value: string
  icon:  string
  color: 'green' | 'emerald' | 'cyan'
}) {
  const border = {
    green:   'border-green-900/40',
    emerald: 'border-emerald-900/40',
    cyan:    'border-cyan-900/40',
  }[color]

  const text = {
    green:   'text-green-400',
    emerald: 'text-emerald-400',
    cyan:    'text-cyan-400',
  }[color]

  return (
    <div className={`bg-[#0b1a0b] border ${border} rounded-xl px-4 py-3
                     flex items-center gap-3`}>
      <span className="text-lg">{icon}</span>
      <div className="min-w-0">
        <p className="text-gray-500 text-xs truncate">{label}</p>
        <p className={`font-bold text-sm ${text} truncate`}>{value}</p>
      </div>
    </div>
  )
}
