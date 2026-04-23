// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT ADDRESSES — deploy.py çalıştırıldıktan sonra güncellenir
// ─────────────────────────────────────────────────────────────────────────────
export const ADDRESSES = {
  EcoToken:      '0x5DCF22aaecF54a6B24fDF2485C586cD31C5B63d6' as `0x${string}`,
  EcoProfile:    '0xCD35fCe6FA0526A83d305446163276BA896532c9' as `0x${string}`,
  EcoTrackerCore:'0x975F0226bAc7B3700C529C2db380Bac4E249d05F' as `0x${string}`,
}

// ─────────────────────────────────────────────────────────────────────────────
// EcoToken ABI — ERC-20 okuma fonksiyonları
// ─────────────────────────────────────────────────────────────────────────────
export const ecoTokenAbi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// EcoProfile ABI — Soulbound Token istatistikleri
// ─────────────────────────────────────────────────────────────────────────────
export const ecoProfileAbi = [
  {
    name: 'hasProfile',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getProfile',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'totalCarbonCredits', type: 'uint256' },
          { name: 'level',              type: 'uint8'   },
          { name: 'actionCount',        type: 'uint256' },
          { name: 'recyclingCount',     type: 'uint256' },
          { name: 'transportCount',     type: 'uint256' },
          { name: 'createdAt',          type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'userToken',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// EcoTrackerCore ABI — Global platform istatistikleri
// ─────────────────────────────────────────────────────────────────────────────
export const ecoTrackerCoreAbi = [
  {
    name: 'getGlobalStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'actions',            type: 'uint256' },
      { name: 'tokensMinted',       type: 'uint256' },
      { name: 'carbonCreditsSaved', type: 'uint256' },
    ],
  },
  {
    name: 'isOracle',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'oracle', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// Level sistemi — EcoProfile kontratındaki eşik değerleriyle birebir aynı
// ─────────────────────────────────────────────────────────────────────────────
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000]

export const LEVEL_LABELS = [
  'Seedling',    // 1
  'Sprout',      // 2
  'Sapling',     // 3
  'Tree',        // 4
  'Grove',       // 5
  'Forest',      // 6
  'Rainforest',  // 7
  'Biome',       // 8
  'Ecosystem',   // 9
  'Gaia',        // 10
]

export function getLevelProgress(credits: number, level: number): number {
  if (level >= 10) return 100
  const current = LEVEL_THRESHOLDS[level - 1]
  const next    = LEVEL_THRESHOLDS[level]
  return Math.min(100, Math.floor(((credits - current) / (next - current)) * 100))
}

export function getNextLevelCredits(level: number): number {
  if (level >= 10) return 0
  return LEVEL_THRESHOLDS[level]
}
