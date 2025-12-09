import type { Protocol, ProtocolCategory } from '@/types/wrapped';

// Sui Mainnet launch date
export const SUI_MAINNET_LAUNCH = new Date('2023-05-03T00:00:00Z');
export const EARLY_BIRD_CUTOFF = new Date('2023-08-03T00:00:00Z'); // 3 months after launch

// Current year for Wrapped
export const WRAPPED_YEAR = 2025;

// Protocol Registry
export const PROTOCOL_REGISTRY: Protocol[] = [
  // DEX / CLMM
  {
    name: 'cetus',
    displayName: 'Cetus',
    category: 'dex',
    packageIds: ['0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb'],
    website: 'https://cetus.zone',
  },
  {
    name: 'turbos',
    displayName: 'Turbos Finance',
    category: 'dex',
    packageIds: ['0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1'],
    website: 'https://turbos.finance',
  },
  {
    name: 'deepbook',
    displayName: 'DeepBook',
    category: 'dex',
    packageIds: ['0xdee9'],
    website: 'https://deepbook.tech',
  },
  {
    name: 'aftermath',
    displayName: 'Aftermath Finance',
    category: 'dex',
    packageIds: ['0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf'],
    website: 'https://aftermath.finance',
  },

  // Lending
  {
    name: 'scallop',
    displayName: 'Scallop',
    category: 'lending',
    packageIds: ['0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf'],
    website: 'https://scallop.io',
  },
  {
    name: 'navi',
    displayName: 'NAVI Protocol',
    category: 'lending',
    packageIds: ['0xd899cf7d2b5db716bd2cf55599fb0d5ee38a3061e7b6bb6eebf73fa5bc4c81ca'],
    website: 'https://naviprotocol.io',
  },
  {
    name: 'suilend',
    displayName: 'Suilend',
    category: 'lending',
    packageIds: ['0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf'],
    website: 'https://suilend.fi',
  },

  // Liquid Staking
  {
    name: 'aftermath_lst',
    displayName: 'Aftermath (afSUI)',
    category: 'lst',
    packageIds: ['0x7f6ce7ade63857c4fd16ef7783fed2dfc4d7fb7e40615abdb653030b76aef0c6'],
    website: 'https://aftermath.finance',
  },
  {
    name: 'haedal',
    displayName: 'Haedal (haSUI)',
    category: 'lst',
    packageIds: ['0xbde4ba4c2e274a60ce15c1cfff9e5c42e136930ee74d84b6ec3b054e2ad1c0b7'],
    website: 'https://haedal.xyz',
  },
  {
    name: 'volo',
    displayName: 'Volo (vSUI)',
    category: 'lst',
    packageIds: ['0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55'],
    website: 'https://volosui.com',
  },

  // NFT Marketplaces
  {
    name: 'kiosk',
    displayName: 'Sui Kiosk',
    category: 'nft',
    packageIds: ['0x2'],
    website: 'https://sui.io',
  },
  {
    name: 'tradeport',
    displayName: 'TradePort',
    category: 'nft',
    packageIds: [],
    website: 'https://tradeport.xyz',
  },
];

// Get protocol by name
export function getProtocol(name: string): Protocol | undefined {
  return PROTOCOL_REGISTRY.find((p) => p.name === name);
}

// Get protocols by category
export function getProtocolsByCategory(category: ProtocolCategory): Protocol[] {
  return PROTOCOL_REGISTRY.filter((p) => p.category === category);
}

// Gas equivalence for ETH comparison
export const ETH_GAS_EQUIVALENCE: Record<string, number> = {
  swap_amm_v2: 150_000,
  swap_amm_v3: 184_523,
  swap_clob: 120_000,
  add_liquidity: 350_000,
  remove_liquidity: 250_000,
  lend: 250_000,
  borrow: 350_000,
  repay: 200_000,
  withdraw: 200_000,
  stake: 150_000,
  unstake: 150_000,
  nft_buy: 200_000,
  nft_sell: 150_000,
  transfer: 21_000,
};

// Category color mapping for visuals
export const CATEGORY_COLORS: Record<ProtocolCategory, { hue: number; name: string }> = {
  dex: { hue: 200, name: 'Blue' },
  lending: { hue: 120, name: 'Green' },
  lst: { hue: 60, name: 'Yellow' },
  nft: { hue: 300, name: 'Purple' },
  bridge: { hue: 30, name: 'Orange' },
  other: { hue: 180, name: 'Cyan' },
};

// Fluid animation presets based on persona
export const PERSONA_FLUID_PRESETS = {
  move_maximalist: {
    turbulence: 85,
    viscosity: 30,
    particleDensity: 90,
  },
  diamond_hand: {
    turbulence: 20,
    viscosity: 80,
    particleDensity: 40,
  },
  yield_architect: {
    turbulence: 50,
    viscosity: 60,
    particleDensity: 70,
  },
  jpeg_mogul: {
    turbulence: 60,
    viscosity: 40,
    particleDensity: 80,
  },
  early_bird: {
    turbulence: 40,
    viscosity: 50,
    particleDensity: 50,
  },
  balanced_builder: {
    turbulence: 50,
    viscosity: 50,
    particleDensity: 50,
  },
};

// Music scales for audio generation - Enhanced with more variety
export const MUSIC_SCALES = {
  major: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'], // Extended pentatonic major
  minor: ['C4', 'Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5', 'F5'], // Extended pentatonic minor
};

// Share message templates
export const SHARE_TEMPLATES = {
  twitter: {
    persona: (title: string, emoji: string) =>
      `My Sui Wrapped 2025 is here! ${emoji}\n\nI'm "${title}"`,
    gasSaved: (amount: string) => `\n💰 Saved ${amount} in gas vs Ethereum`,
    transactions: (count: string) => `\n⚡ ${count} transactions`,
    protocols: (count: number) => `\n🔗 Used ${count} protocols`,
    footer: '\n\nGet yours at wrapped.sui.io\n#SuiWrapped #Sui',
  },
};

// Error codes
export const ERROR_CODES = {
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  NO_ACTIVITY: 'NO_ACTIVITY',
  NO_TRANSACTIONS: 'NO_TRANSACTIONS',
  INDEXER_BEHIND: 'INDEXER_BEHIND',
  RATE_LIMITED: 'RATE_LIMITED',
  GENERATION_FAILED: 'GENERATION_FAILED',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  wrapped: (address: string) => `/api/wrapped/${address}`,
  og: (address: string) => `/api/wrapped/${address}/og`,
  generate: '/api/wrapped/generate',
  leaderboard: '/api/leaderboard',
};

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
  cardTransition: 500,
  fadeIn: 300,
  fadeOut: 200,
  numberCount: 1500,
  progressBar: 2000,
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};
