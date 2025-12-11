// Sui Wrapped - Core Types

export enum Persona {
  MOVE_MAXIMALIST = 'move_maximalist',
  DIAMOND_HAND = 'diamond_hand',
  YIELD_ARCHITECT = 'yield_architect',
  JPEG_MOGUL = 'jpeg_mogul',
  EARLY_BIRD = 'early_bird',
  BALANCED_BUILDER = 'balanced_builder',
}

export interface PersonaCopy {
  title: string;
  description: string;
  emoji: string;
}

export const PERSONA_COPY: Record<Persona, PersonaCopy> = {
  [Persona.MOVE_MAXIMALIST]: {
    title: 'The Move Maximalist',
    description: 'You live and breathe Sui. High transaction volume across multiple protocols makes you a true power user of the Move ecosystem.',
    emoji: '⚡',
  },
  [Persona.DIAMOND_HAND]: {
    title: 'The Diamond Hand',
    description: "HODL is your middle name. You've accumulated SUI and LSTs while barely touching the sell button. Conviction personified.",
    emoji: '💎',
  },
  [Persona.YIELD_ARCHITECT]: {
    title: 'The Yield Architect',
    description: "Efficiency is your game. You've spent most of your time optimizing yields across lending pools and liquidity positions.",
    emoji: '🏗️',
  },
  [Persona.JPEG_MOGUL]: {
    title: 'The JPEG Mogul',
    description: "Digital art and collectibles are your domain. Your Kiosk is a gallery, and you're not afraid to support creators with royalties.",
    emoji: '🖼️',
  },
  [Persona.EARLY_BIRD]: {
    title: 'The Early Bird',
    description: 'You saw the potential early. Joining Sui in its first months puts you among the OG believers of the ecosystem.',
    emoji: '🐦',
  },
  [Persona.BALANCED_BUILDER]: {
    title: 'The Balanced Builder',
    description: "Jack of all trades, master of exploration. You've dipped your toes across the ecosystem without overcommitting to one area.",
    emoji: '🔨',
  },
};

export type ActionCategory =
  | 'swap'
  | 'add_liquidity'
  | 'remove_liquidity'
  | 'stake'
  | 'unstake'
  | 'lend'
  | 'borrow'
  | 'repay'
  | 'withdraw'
  | 'transfer'
  | 'mint'
  | 'burn'
  | 'nft_buy'
  | 'nft_sell'
  | 'nft_list'
  | 'bridge'
  | 'other';

export type ProtocolCategory = 'dex' | 'lending' | 'lst' | 'nft' | 'bridge' | 'other';

export interface Protocol {
  name: string;
  displayName: string;
  category: ProtocolCategory;
  packageIds: string[];
  website: string;
  logoUrl?: string;
}

export interface ProtocolBreakdown {
  protocol: string;
  displayName: string;
  category: ProtocolCategory;
  transactionCount: number;
  commandCount: number;
  volumeUsd: number;
  gasSpent: number;
  percentage: number;
}

export interface CategoryBreakdown {
  category: ProtocolCategory;
  transactionCount: number;
  commandCount: number;
  volumeUsd: number;
  gasSpent: number;
  percentage: number;
}

export interface TradingMetrics {
  totalVolumeUsd: number;
  makerVolumeUsd: number;
  takerVolumeUsd: number;
  swapCount: number;
  bestTradePercentGain: number;
  bestTradeDate?: string;
  bestTradeProtocol?: string;
  rangeEfficiency?: number;
  totalPositions?: number;
  totalFeesEarned?: number;
}

export interface LendingMetrics {
  totalSuppliedUsd: number;
  totalBorrowedUsd: number;
  protocolsUsed: string[];
  minHealthFactor: number;
  minHealthFactorDate?: string;
  liquidations: number;
  closeCalls: number;
  healthFactorResilienceScore: number;
}

export interface StakingMetrics {
  totalStakedSui: number;
  totalRewardsEarned: number;
  lstPortfolio: {
    token: string;
    displayName: string;
    amount: number;
    percentage: number;
  }[];
  longestStakeDays: number;
  isStillHolding: boolean;
}

export interface NftMetrics {
  totalBought: number;
  totalSold: number;
  volumeUsd: number;
  royaltiesPaidUsd: number;
  collectionsInteracted: number;
  creatorSupportScore: number;
}

export interface NFTHolding {
  collection: string;
  displayName: string;
  count: number;
  isBluechip: boolean;
  imageUrl?: string; // Collection thumbnail
}

export interface NFTHoldings {
  holdings: NFTHolding[];
  totalNFTs: number;
  bluechipCount: number;
}

export interface GasSavings {
  totalSuiGasSpent: string; // MIST as string for precision
  totalSuiGasUsd: number;
  hypotheticalEthGasUsd: number;
  savingsUsd: number;
  savingsMultiple: number;
}

export interface WrappedData {
  // User identification
  address: string;
  year: number;

  // Basic metrics
  firstTransactionTimestamp: number;
  firstTransactionDigest: string;
  firstTransactionAction: string;
  firstTransactionProtocol?: string;
  daysAfterMainnetLaunch: number;
  earlierThanPercentage: number;

  // Activity metrics
  totalTransactions: number;
  totalCommands: number;
  activeDays: number;
  uniqueProtocols: string[];

  // Gas savings
  gasSavings: GasSavings;

  // Protocol breakdown
  protocolBreakdown: ProtocolBreakdown[];
  categoryBreakdown: Record<ProtocolCategory, CategoryBreakdown>;

  // Domain-specific metrics
  tradingMetrics: TradingMetrics;
  lendingMetrics: LendingMetrics;
  stakingMetrics: StakingMetrics;
  nftMetrics: NftMetrics;
  nftHoldings: NFTHoldings;

  // Persona
  persona: Persona;
  personaConfidence: number;
  personaReasoning: string;

  // Percentiles (compared to all users)
  percentiles: {
    transactions: number;
    protocols: number;
    volume: number;
    activeDays: number;
  };

  // Generation metadata
  generatedAt: number;
  indexerCheckpoint: number;
}

// Card-specific types for the Stories UI
export interface StoryCard {
  id: string;
  title: string;
  component: React.ComponentType<{ data: WrappedData }>;
}

// Fluid visual parameters
export interface FluidParams {
  turbulence: number;  // 0-100
  viscosity: number;   // 0-100
  hue: number;         // 0-360
  saturation: number;  // 0-100
  brightness: number;  // 0-100
  particleDensity: number; // 0-100
}

// Audio parameters
export interface AudioParams {
  bpm: number;         // 60-140
  key: 'major' | 'minor';
  layers: {
    dex: boolean;
    lending: boolean;
    staking: boolean;
    nft: boolean;
  };
}

// Share options
export interface ShareOptions {
  showPersona: boolean;
  showGas: boolean;
  showTxCount: boolean;
  showProtocols: boolean;
}

// API response types
export interface WrappedApiResponse {
  success: boolean;
  data?: WrappedData;
  error?: {
    code: string;
    message: string;
  };
}

// Loading state messages
export const LOADING_MESSAGES = [
  'Diving into checkpoint history...',
  'Analyzing Programmable Transaction Blocks...',
  'Calculating your gas savings...',
  'Identifying your trading patterns...',
  'Discovering your protocol universe...',
  'Measuring your DeFi risk profile...',
  'Evaluating your staking commitment...',
  'Determining your persona...',
];
