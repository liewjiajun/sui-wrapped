// Sui Wrapped - Blockchain Data API Service
// Uses existing APIs to fetch real user data

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import type { WrappedData, Persona, ProtocolCategory, ProtocolBreakdown } from '@/types/wrapped';
import { PROTOCOL_REGISTRY, ETH_GAS_EQUIVALENCE, SUI_MAINNET_LAUNCH } from './constants';

// Initialize Sui client
const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

// API Configuration
const SUISCAN_API = 'https://suiscan.xyz/api';
const BLOCKVISION_API = 'https://api.blockvision.org/v2/sui';

// Rate limiting helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// SUI RPC METHODS
// ============================================================================

export async function getAccountBalance(address: string) {
  try {
    const balance = await suiClient.getBalance({
      owner: address,
      coinType: '0x2::sui::SUI',
    });
    return BigInt(balance.totalBalance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return BigInt(0);
  }
}

export async function getAllBalances(address: string) {
  try {
    const balances = await suiClient.getAllBalances({ owner: address });
    return balances;
  } catch (error) {
    console.error('Error fetching all balances:', error);
    return [];
  }
}

export async function getOwnedObjects(address: string, cursor?: string) {
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      cursor,
      limit: 50,
      options: {
        showType: true,
        showContent: true,
      },
    });
    return objects;
  } catch (error) {
    console.error('Error fetching owned objects:', error);
    return { data: [], hasNextPage: false, nextCursor: null };
  }
}

// ============================================================================
// TRANSACTION HISTORY (Using SuiScan API)
// ============================================================================

interface SuiScanTransaction {
  txDigest: string;
  timestampMs: number;
  sender: string;
  checkpoint: number;
  gasUsed: {
    computationCost: string;
    storageCost: string;
    storageRebate: string;
  };
  status: string;
  kind: string;
  moveCall?: {
    package: string;
    module: string;
    function: string;
  }[];
}

export async function getTransactionHistory(
  address: string,
  startTime?: number,
  endTime?: number
): Promise<SuiScanTransaction[]> {
  const transactions: SuiScanTransaction[] = [];
  let cursor: string | undefined;
  let hasMore = true;
  const maxPages = 20; // Limit to avoid rate limits
  let page = 0;

  // Default to 2025 if no time range specified
  const start = startTime || new Date('2025-01-01').getTime();
  const end = endTime || Date.now();

  while (hasMore && page < maxPages) {
    try {
      // Use Sui RPC to get transactions
      const result = await suiClient.queryTransactionBlocks({
        filter: {
          FromAddress: address,
        },
        cursor,
        limit: 50,
        order: 'descending',
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
        },
      });

      for (const tx of result.data) {
        const timestamp = Number(tx.timestampMs || 0);

        // Filter by time range
        if (timestamp < start) {
          hasMore = false;
          break;
        }

        if (timestamp <= end) {
          const gasUsed = tx.effects?.gasUsed;
          transactions.push({
            txDigest: tx.digest,
            timestampMs: timestamp,
            sender: address,
            checkpoint: Number(tx.checkpoint || 0),
            gasUsed: {
              computationCost: gasUsed?.computationCost || '0',
              storageCost: gasUsed?.storageCost || '0',
              storageRebate: gasUsed?.storageRebate || '0',
            },
            status: tx.effects?.status?.status || 'unknown',
            kind: tx.transaction?.data?.transaction?.kind || 'unknown',
            moveCall: extractMoveCalls(tx),
          });
        }
      }

      hasMore = result.hasNextPage;
      cursor = result.nextCursor || undefined;
      page++;

      // Rate limiting
      await delay(100);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      break;
    }
  }

  return transactions;
}

// Extract MoveCall information from transaction
function extractMoveCalls(tx: any): { package: string; module: string; function: string }[] {
  const moveCalls: { package: string; module: string; function: string }[] = [];

  try {
    const txData = tx.transaction?.data?.transaction;
    if (txData?.kind === 'ProgrammableTransaction') {
      const commands = txData.transactions || [];
      for (const cmd of commands) {
        if (cmd.MoveCall) {
          moveCalls.push({
            package: cmd.MoveCall.package,
            module: cmd.MoveCall.module,
            function: cmd.MoveCall.function,
          });
        }
      }
    }
  } catch (error) {
    // Ignore parsing errors
  }

  return moveCalls;
}

// ============================================================================
// PROTOCOL CLASSIFICATION
// ============================================================================

const PROTOCOL_PACKAGES: Record<string, { name: string; category: ProtocolCategory }> = {
  // Cetus
  '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb': { name: 'cetus', category: 'dex' },
  '0x996c4d9480708fb8b92aa7acf819fb0497b5ec8e65ba06601cae2fb6db3312c3': { name: 'cetus', category: 'dex' },

  // Turbos
  '0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1': { name: 'turbos', category: 'dex' },

  // DeepBook
  '0xdee9': { name: 'deepbook', category: 'dex' },
  '0x000000000000000000000000000000000000000000000000000000000000dee9': { name: 'deepbook', category: 'dex' },

  // Aftermath
  '0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf': { name: 'aftermath', category: 'dex' },
  '0x7f6ce7ade63857c4fd16ef7783fed2dfc4d7fb7e40615abdb653030b76aef0c6': { name: 'aftermath_lst', category: 'lst' },

  // Scallop
  '0x5ca17430c1d046fae9edeaa8fd76c7b4d186f30b39f0e2b62e5c66ef65bc0d1b': { name: 'scallop', category: 'lending' },
  '0x83c5c17d8f4fc3e1df5a1f5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e': { name: 'scallop', category: 'lending' },

  // NAVI
  '0xd899cf7d2b5db716bd2cf55599fb0d5ee38a3061e7b6bb6eebf73fa5bc4c81ca': { name: 'navi', category: 'lending' },

  // Suilend
  '0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf': { name: 'suilend', category: 'lending' },

  // Haedal
  '0xbde4ba4c2e274a60ce15c1cfff9e5c42e136930ee74d84b6ec3b054e2ad1c0b7': { name: 'haedal', category: 'lst' },

  // Volo
  '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55': { name: 'volo', category: 'lst' },

  // Kiosk (NFT)
  '0x0000000000000000000000000000000000000000000000000000000000000002': { name: 'kiosk', category: 'nft' },
};

function classifyTransaction(tx: SuiScanTransaction): {
  protocol: string;
  category: ProtocolCategory;
  action: string;
} {
  const defaultResult = { protocol: 'unknown', category: 'other' as ProtocolCategory, action: 'unknown' };

  if (!tx.moveCall || tx.moveCall.length === 0) {
    return defaultResult;
  }

  for (const call of tx.moveCall) {
    const packageInfo = PROTOCOL_PACKAGES[call.package];
    if (packageInfo) {
      // Determine action based on function name
      const func = call.function.toLowerCase();
      let action = 'other';

      if (func.includes('swap')) action = 'swap';
      else if (func.includes('add_liquidity') || func.includes('deposit')) action = 'add_liquidity';
      else if (func.includes('remove_liquidity') || func.includes('withdraw')) action = 'remove_liquidity';
      else if (func.includes('stake') || func.includes('request_stake')) action = 'stake';
      else if (func.includes('unstake') || func.includes('request_unstake')) action = 'unstake';
      else if (func.includes('borrow')) action = 'borrow';
      else if (func.includes('repay')) action = 'repay';
      else if (func.includes('supply') || func.includes('lend')) action = 'lend';
      else if (func.includes('purchase') || func.includes('buy')) action = 'nft_buy';
      else if (func.includes('list') || func.includes('sell')) action = 'nft_sell';

      return {
        protocol: packageInfo.name,
        category: packageInfo.category,
        action,
      };
    }
  }

  return defaultResult;
}

// ============================================================================
// WRAPPED DATA GENERATION
// ============================================================================

export async function generateWrappedData(address: string, year: number = 2025): Promise<WrappedData> {
  const startTime = new Date(`${year}-01-01`).getTime();
  const endTime = new Date(`${year}-12-31T23:59:59`).getTime();

  // Fetch transaction history
  console.log(`Fetching transactions for ${address}...`);
  const transactions = await getTransactionHistory(address, startTime, endTime);
  console.log(`Found ${transactions.length} transactions`);

  if (transactions.length === 0) {
    throw new Error('No transactions found for this address in ' + year);
  }

  // Sort by timestamp
  transactions.sort((a, b) => a.timestampMs - b.timestampMs);

  // First transaction info
  const firstTx = transactions[0];
  const firstTxDate = new Date(firstTx.timestampMs);
  const daysAfterMainnet = Math.floor(
    (firstTx.timestampMs - SUI_MAINNET_LAUNCH.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate gas spent
  let totalGasMist = BigInt(0);
  for (const tx of transactions) {
    const computation = BigInt(tx.gasUsed.computationCost || 0);
    const storage = BigInt(tx.gasUsed.storageCost || 0);
    const rebate = BigInt(tx.gasUsed.storageRebate || 0);
    totalGasMist += computation + storage - rebate;
  }

  // Count commands (PTB decomposition)
  let totalCommands = 0;
  for (const tx of transactions) {
    totalCommands += Math.max(tx.moveCall?.length || 1, 1);
  }

  // Protocol breakdown
  const protocolStats: Record<string, {
    count: number;
    commands: number;
    category: ProtocolCategory;
  }> = {};

  for (const tx of transactions) {
    const classification = classifyTransaction(tx);
    const protocol = classification.protocol;

    if (!protocolStats[protocol]) {
      protocolStats[protocol] = {
        count: 0,
        commands: 0,
        category: classification.category,
      };
    }

    protocolStats[protocol].count++;
    protocolStats[protocol].commands += tx.moveCall?.length || 1;
  }

  // Generate protocol breakdown
  const protocolBreakdown: ProtocolBreakdown[] = Object.entries(protocolStats)
    .filter(([name]) => name !== 'unknown')
    .map(([name, stats]) => ({
      protocol: name,
      displayName: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      category: stats.category,
      transactionCount: stats.count,
      commandCount: stats.commands,
      volumeUsd: 0, // Would need price data to calculate
      gasSpent: 0,
      percentage: (stats.count / transactions.length) * 100,
    }))
    .sort((a, b) => b.transactionCount - a.transactionCount);

  // Category breakdown
  const categoryBreakdown: Record<ProtocolCategory, {
    category: ProtocolCategory;
    transactionCount: number;
    commandCount: number;
    volumeUsd: number;
    gasSpent: number;
    percentage: number;
  }> = {
    dex: { category: 'dex', transactionCount: 0, commandCount: 0, volumeUsd: 0, gasSpent: 0, percentage: 0 },
    lending: { category: 'lending', transactionCount: 0, commandCount: 0, volumeUsd: 0, gasSpent: 0, percentage: 0 },
    lst: { category: 'lst', transactionCount: 0, commandCount: 0, volumeUsd: 0, gasSpent: 0, percentage: 0 },
    nft: { category: 'nft', transactionCount: 0, commandCount: 0, volumeUsd: 0, gasSpent: 0, percentage: 0 },
    bridge: { category: 'bridge', transactionCount: 0, commandCount: 0, volumeUsd: 0, gasSpent: 0, percentage: 0 },
    other: { category: 'other', transactionCount: 0, commandCount: 0, volumeUsd: 0, gasSpent: 0, percentage: 0 },
  };

  for (const protocol of protocolBreakdown) {
    const cat = categoryBreakdown[protocol.category];
    cat.transactionCount += protocol.transactionCount;
    cat.commandCount += protocol.commandCount;
  }

  // Calculate percentages
  const totalCatTx = Object.values(categoryBreakdown).reduce((sum, c) => sum + c.transactionCount, 0);
  for (const cat of Object.values(categoryBreakdown)) {
    cat.percentage = totalCatTx > 0 ? (cat.transactionCount / totalCatTx) * 100 : 0;
  }

  // Active days
  const activeDays = new Set(
    transactions.map(tx => new Date(tx.timestampMs).toDateString())
  ).size;

  // Unique protocols
  const uniqueProtocols = [...new Set(protocolBreakdown.map(p => p.protocol))];

  // Gas savings calculation
  const suiGasUsd = Number(totalGasMist) / 1e9 * 3.5; // Assuming $3.5 SUI price
  let ethEquivalentGas = 0;
  for (const tx of transactions) {
    const classification = classifyTransaction(tx);
    const gasKey = `${classification.action}_${classification.category === 'dex' ? 'amm_v3' : classification.category}`;
    ethEquivalentGas += ETH_GAS_EQUIVALENCE[gasKey] || ETH_GAS_EQUIVALENCE['transfer'] || 21000;
  }
  const ethGasUsd = (ethEquivalentGas * 30 / 1e9) * 2500; // 30 gwei, $2500 ETH

  // Determine persona
  const persona = determinePersona({
    totalTransactions: transactions.length,
    uniqueProtocols: uniqueProtocols.length,
    categoryBreakdown,
    daysAfterMainnet,
    activeDays,
  });

  return {
    address,
    year,

    firstTransactionTimestamp: firstTx.timestampMs,
    firstTransactionDigest: firstTx.txDigest,
    firstTransactionAction: firstTx.moveCall?.[0]?.function || 'Transaction',
    firstTransactionProtocol: classifyTransaction(firstTx).protocol,
    daysAfterMainnetLaunch: Math.max(daysAfterMainnet, 0),
    earlierThanPercentage: Math.max(0, 100 - (daysAfterMainnet / 600) * 100),

    totalTransactions: transactions.length,
    totalCommands,
    activeDays,
    uniqueProtocols,

    gasSavings: {
      totalSuiGasSpent: totalGasMist.toString(),
      totalSuiGasUsd: suiGasUsd,
      hypotheticalEthGasUsd: ethGasUsd,
      savingsUsd: ethGasUsd - suiGasUsd,
      savingsMultiple: ethGasUsd / Math.max(suiGasUsd, 0.01),
    },

    protocolBreakdown,
    categoryBreakdown,

    tradingMetrics: {
      totalVolumeUsd: 0,
      makerVolumeUsd: 0,
      takerVolumeUsd: 0,
      swapCount: categoryBreakdown.dex.transactionCount,
      bestTradePercentGain: 0,
      bestTradeDate: undefined,
      bestTradeProtocol: undefined,
      rangeEfficiency: undefined,
      totalPositions: undefined,
      totalFeesEarned: undefined,
    },

    lendingMetrics: {
      totalSuppliedUsd: 0,
      totalBorrowedUsd: 0,
      protocolsUsed: protocolBreakdown
        .filter(p => p.category === 'lending')
        .map(p => p.displayName),
      minHealthFactor: 999,
      minHealthFactorDate: undefined,
      liquidations: 0,
      closeCalls: 0,
      healthFactorResilienceScore: 100,
    },

    stakingMetrics: {
      totalStakedSui: 0,
      totalRewardsEarned: 0,
      lstPortfolio: [],
      longestStakeDays: 0,
      isStillHolding: false,
    },

    nftMetrics: {
      totalBought: 0,
      totalSold: 0,
      volumeUsd: 0,
      royaltiesPaidUsd: 0,
      collectionsInteracted: 0,
      creatorSupportScore: 0,
    },

    persona: persona.type,
    personaConfidence: persona.confidence,
    personaReasoning: persona.reasoning,

    percentiles: {
      transactions: Math.min(99, transactions.length / 10),
      protocols: Math.min(99, uniqueProtocols.length * 8),
      volume: 50,
      activeDays: Math.min(99, activeDays / 3),
    },

    generatedAt: Date.now(),
    indexerCheckpoint: 0,
  };
}

// ============================================================================
// PERSONA CLASSIFICATION
// ============================================================================

function determinePersona(stats: {
  totalTransactions: number;
  uniqueProtocols: number;
  categoryBreakdown: Record<ProtocolCategory, { percentage: number }>;
  daysAfterMainnet: number;
  activeDays: number;
}): { type: Persona; confidence: number; reasoning: string } {
  const scores: { type: Persona; score: number; reasoning: string }[] = [];

  // Early Bird
  if (stats.daysAfterMainnet <= 90) {
    scores.push({
      type: 'early_bird' as Persona,
      score: 100 - stats.daysAfterMainnet,
      reasoning: `Joined ${stats.daysAfterMainnet} days after mainnet launch`,
    });
  }

  // Move Maximalist
  if (stats.totalTransactions > 100 && stats.uniqueProtocols > 3) {
    scores.push({
      type: 'move_maximalist' as Persona,
      score: (stats.totalTransactions / 10) + (stats.uniqueProtocols * 5),
      reasoning: `${stats.totalTransactions} transactions across ${stats.uniqueProtocols} protocols`,
    });
  }

  // Yield Architect
  const yieldPercentage =
    (stats.categoryBreakdown.lending?.percentage || 0) +
    (stats.categoryBreakdown.dex?.percentage || 0) +
    (stats.categoryBreakdown.lst?.percentage || 0);
  if (yieldPercentage > 60) {
    scores.push({
      type: 'yield_architect' as Persona,
      score: yieldPercentage,
      reasoning: `${yieldPercentage.toFixed(0)}% of activity in yield protocols`,
    });
  }

  // JPEG Mogul
  const nftPercentage = stats.categoryBreakdown.nft?.percentage || 0;
  if (nftPercentage > 50) {
    scores.push({
      type: 'jpeg_mogul' as Persona,
      score: nftPercentage,
      reasoning: `${nftPercentage.toFixed(0)}% NFT activity`,
    });
  }

  // Diamond Hand (would need balance data for accurate detection)
  if (stats.activeDays > 180) {
    scores.push({
      type: 'diamond_hand' as Persona,
      score: stats.activeDays / 3,
      reasoning: `Active for ${stats.activeDays} days`,
    });
  }

  // Default
  if (scores.length === 0) {
    return {
      type: 'balanced_builder' as Persona,
      confidence: 0.5,
      reasoning: 'Well-rounded Sui ecosystem participant',
    };
  }

  // Return highest scoring persona
  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];

  return {
    type: winner.type,
    confidence: Math.min(winner.score / 100, 0.95),
    reasoning: winner.reasoning,
  };
}

// ============================================================================
// CACHING
// ============================================================================

const cache = new Map<string, { data: WrappedData; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function getWrappedData(address: string, year: number = 2025): Promise<WrappedData> {
  const cacheKey = `${address}-${year}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await generateWrappedData(address, year);
  cache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}
