'use client'

import { useAccount }      from 'wagmi'
import { useReadContract }  from 'wagmi'
import {
  ADDRESSES, ecoProfileAbi,
  LEVEL_LABELS, getLevelProgress, getNextLevelCredits,
} from '@/lib/contracts'

const LEVEL_COLORS = [
  'text-gray-400',   // 1
  'text-green-400',  // 2
  'text-green-400',  // 3
  'text-emerald-400',// 4
  'text-emerald-300',// 5
  'text-teal-300',   // 6
  'text-cyan-300',   // 7
  'text-cyan-200',   // 8
  'text-blue-300',   // 9
  'text-violet-300', // 10
]

export function EcoProfileCard() {
  const { address } = useAccount()

  const { data: hasProfile } = useReadContract({
    address: ADDRESSES.EcoProfile,
    abi:     ecoProfileAbi,
    functionName: 'hasProfile',
    args:    [address!],
    query:   { enabled: !!address },
  })

  const { data: profile, isLoading } = useReadContract({
    address: ADDRESSES.EcoProfile,
    abi:     ecoProfileAbi,
    functionName: 'getProfile',
    args:    [address!],
    query:   { enabled: !!address && !!hasProfile },
  })

  const { data: tokenId } = useReadContract({
    address: ADDRESSES.EcoProfile,
    abi:     ecoProfileAbi,
    functionName: 'userToken',
    args:    [address!],
    query:   { enabled: !!address && !!hasProfile },
  })

  const level   = profile ? Number(profile.level) : 0
  const credits = profile ? Number(profile.totalCarbonCredits) : 0
  const progress = profile ? getLevelProgress(credits, level) : 0
  const nextLvl  = profile ? getNextLevelCredits(level) : 0
  const levelColor = level > 0 ? LEVEL_COLORS[level - 1] : 'text-gray-500'

  return (
    <div className="bg-[#0b1a0b] border border-green-900/30 rounded-2xl p-6 shadow-glow">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-white font-semibold text-sm">EcoProfile</span>
          <span className="text-gray-600 text-xs">· Soulbound NFT</span>
        </div>
        {tokenId !== undefined && hasProfile && (
          <span className="text-gray-600 text-xs font-mono">#{tokenId.toString()}</span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm py-8 justify-center">
          <div className="w-4 h-4 border border-green-500/30 border-t-green-400
                          rounded-full animate-spin" />
          Profil yükleniyor...
        </div>
      )}

      {!isLoading && !hasProfile && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-1">Henüz profil yok</p>
          <p className="text-gray-600 text-xs">
            Oracle bir çevreci eylem kaydettiğinde profil otomatik açılır.
          </p>
        </div>
      )}

      {!isLoading && hasProfile && profile && (
        <>
          {/* Seviye Rozeti */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-green-500/10 border border-green-500/20
                            flex items-center justify-center flex-shrink-0">
              <span className={`text-2xl font-bold ${levelColor}`}>{level}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-base ${levelColor}`}>
                {LEVEL_LABELS[level - 1]}
              </p>
              <p className="text-gray-500 text-xs">Level {level} / 10</p>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-green-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full
                             transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {level < 10 && (
                <p className="text-gray-600 text-xs mt-1">
                  {credits} / {nextLvl} kredite sonraki seviye
                </p>
              )}
            </div>
          </div>

          {/* İstatistik Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Karbon Kredisi"  value={credits.toLocaleString()} accent="green" />
            <Stat label="Toplam Eylem"    value={Number(profile.actionCount).toLocaleString()} />
            <Stat label="Geri Dönüşüm"   value={Number(profile.recyclingCount).toLocaleString()} accent="emerald" />
            <Stat label="Toplu Taşıma"   value={Number(profile.transportCount).toLocaleString()} accent="cyan" />
          </div>

          {/* Üyelik tarihi */}
          <p className="text-gray-700 text-xs mt-4 text-right">
            Üye:{' '}
            {new Date(Number(profile.createdAt) * 1000).toLocaleDateString('tr-TR')}
          </p>
        </>
      )}
    </div>
  )
}

function Stat({
  label, value, accent = 'gray',
}: {
  label: string
  value: string
  accent?: 'green' | 'emerald' | 'cyan' | 'gray'
}) {
  const colors = {
    green:   'text-green-400',
    emerald: 'text-emerald-400',
    cyan:    'text-cyan-400',
    gray:    'text-white',
  }
  return (
    <div className="bg-[#0e220e] border border-green-900/20 rounded-xl p-3">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`font-bold text-lg ${colors[accent]}`}>{value}</p>
    </div>
  )
}
