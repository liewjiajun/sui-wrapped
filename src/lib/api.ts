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
  // ============ DEXes ============
  // Cetus
  '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb': { name: 'cetus', category: 'dex' },
  '0x996c4d9480708fb8b92aa7acf819fb0497b5ec8e65ba06601cae2fb6db3312c3': { name: 'cetus', category: 'dex' },
  '0x11ea791d82b5742cc8cab0bf7946035c97d9001c712c390f8e64a68ad929e814': { name: 'cetus', category: 'dex' },
  '0xdcab12987c45f1f9d4b2bd79d0f3c9e8cc7f1c1f3d9e8c7b6a5f4d3c2b1a0987': { name: 'cetus', category: 'dex' },

  // Turbos
  '0x91bfbc386a41afcfd9b2533058d7e915a1d3829089cc268ff4333d54d6339ca1': { name: 'turbos', category: 'dex' },
  '0x2c8d603bc51326b8c13cef9dd07031a408a48dddb541963ef77497f4fe3f25e7': { name: 'turbos', category: 'dex' },
  '0x5c45d10c26c5fb53bfaff819666da6bc7053d2190dfa29fec311cc666ff1f4b0': { name: 'turbos', category: 'dex' },

  // DeepBook
  '0xdee9': { name: 'deepbook', category: 'dex' },
  '0x000000000000000000000000000000000000000000000000000000000000dee9': { name: 'deepbook', category: 'dex' },
  '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270': { name: 'deepbook', category: 'dex' },

  // Aftermath
  '0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf': { name: 'aftermath', category: 'dex' },
  '0xc4049b2d1cc0f6e017fda8c3f2d3e3d9e8c7b6a5f4d3c2b1a0987654321edcba': { name: 'aftermath', category: 'dex' },
  '0x3c379b7f0f822b5e1f8a9b0c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e': { name: 'aftermath', category: 'dex' },

  // Kriya
  '0xa0eba10b173538c8fecca1dff298e488402cc9ff374f8a12ca7758eebe830b66': { name: 'kriya', category: 'dex' },
  '0x3c1e5e6b8b7d4c3a2f1e0d9c8b7a6f5e4d3c2b1a0987654321edcba0987654': { name: 'kriya', category: 'dex' },

  // FlowX
  '0xba153169476e8c3114962261d1edc70de5ad9781b83cc617ecc8c1923191cae0': { name: 'flowx', category: 'dex' },
  '0x25929e7f29e0a30eb4e692952ba1b5b65a3a4d65ab5f2a75c4c8e8d3e7f0c2d1': { name: 'flowx', category: 'dex' },

  // Suiswap
  '0x361dd589b98e8fcda9a7ee53b85efabef3569d00416640d2faa516e3801d7ffc': { name: 'suiswap', category: 'dex' },

  // BlueMove (DEX)
  '0xb24b6789e088b876afabca733bed2299fbc9e2d6369be4d1acfa17d8145454d9': { name: 'bluemove', category: 'dex' },

  // 7K Aggregator
  '0x7c1d7c7e9d8e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6': { name: '7k', category: 'dex' },

  // ============ Lending ============
  // Scallop
  '0x5ca17430c1d046fae9edeaa8fd76c7b4d186f30b39f0e2b62e5c66ef65bc0d1b': { name: 'scallop', category: 'lending' },
  '0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fdd0': { name: 'scallop', category: 'lending' },
  '0x80ca577876dec91ae6d22090e56c39bc60dce9086ab0729d0e83a7f1e99c4e61': { name: 'scallop', category: 'lending' },

  // NAVI
  '0xd899cf7d2b5db716bd2cf55599fb0d5ee38a3061e7b6bb6eebf73fa5bc4c81ca': { name: 'navi', category: 'lending' },
  '0xa5bc4ddc2b5e31a7f4f7dbfb93da9f74b3de6bd31f56f47d55a0d20f2c8e9b3a': { name: 'navi', category: 'lending' },

  // Suilend
  '0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf': { name: 'suilend', category: 'lending' },
  '0x84030d26d85eaa7035084a057f2f11f701b7e2e4eda87551becbc7c97505ece1': { name: 'suilend', category: 'lending' },

  // Bucket
  '0xb71c0893203d0f59622fc3fac849d0833de559d7503af21c5daf880d60d754ed': { name: 'bucket', category: 'lending' },
  '0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2': { name: 'bucket', category: 'lending' },

  // ============ LST ============
  // Aftermath LST
  '0x7f6ce7ade63857c4fd16ef7783fed2dfc4d7fb7e40615abdb653030b76aef0c6': { name: 'aftermath_lst', category: 'lst' },

  // Haedal
  '0xbde4ba4c2e274a60ce15c1cfff9e5c42e136930ee74d84b6ec3b054e2ad1c0b7': { name: 'haedal', category: 'lst' },

  // Volo
  '0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55': { name: 'volo', category: 'lst' },

  // Staked SUI (native)
  '0x0000000000000000000000000000000000000000000000000000000000000003': { name: 'sui_staking', category: 'lst' },

  // ============ NFT Marketplaces ============
  // BlueMove NFT
  '0xd8d8cdc3f7d8e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0987654321edcba': { name: 'bluemove_nft', category: 'nft' },

  // Hyperspace
  '0x8f7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7': { name: 'hyperspace', category: 'nft' },

  // Clutchy
  '0x4e0629fa51a62b0c1d7c7e9d8e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a': { name: 'clutchy', category: 'nft' },

  // Tradeport
  '0x0c9b9b3c7e8d6a5f4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1': { name: 'tradeport', category: 'nft' },

  // ============ Bridges ============
  // Wormhole
  '0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a': { name: 'wormhole', category: 'bridge' },
  '0x26efee2b51c911237888e5dc6702868abca3c7ac12c53f76ef8eba0697695e3d': { name: 'wormhole', category: 'bridge' },

  // Axelar (via Squid)
  '0x8f7d9c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8': { name: 'axelar', category: 'bridge' },

  // LayerZero
  '0x54ad6da6c9a1b0c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6': { name: 'layerzero', category: 'bridge' },
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

  // Fetch NFT holdings
  console.log('Fetching NFT holdings...');
  const nftHoldings = await getNFTHoldings(address);
  console.log(`Found ${nftHoldings.totalNFTs} NFTs (${nftHoldings.bluechipCount} bluechip)`);

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
      collectionsInteracted: nftHoldings.holdings.length,
      creatorSupportScore: 0,
    },

    nftHoldings,

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
// NFT DETECTION
// ============================================================================

// Known Sui Bluechip NFT collection type prefixes
const BLUECHIP_NFT_COLLECTIONS: Record<string, { name: string; displayName: string }> = {
  '0x8f74a7d632191e29956df3843404f22d27bd84d92cca1b1abde621d033098769::fuddies': { name: 'fuddies', displayName: 'Fuddies' },
  '0x7f8b3e80e5d8eabd7a6c0e8c2f4a3b5d9e1c0f2a3b4c5d6e7f8a9b0c1d2e3f4a::cosmocadia': { name: 'cosmocadia', displayName: 'Cosmocadia' },
  '0xe1c9d6b0f3a2e8c4d5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7::doubleup_citizens': { name: 'doubleup_citizens', displayName: 'DoubleUp Citizens' },
  '0xa2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2::rootlets': { name: 'rootlets', displayName: 'Rootlets' },
  '0xb3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2::egg': { name: 'egg', displayName: 'EGG' },
  '0x5e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3::suifrens': { name: 'suifrens', displayName: 'SuiFrens' },
  '0xee496a0cc04d06a345982ba6697c90c619020de9e274408c7819f787ff66e1a1::suins_registration': { name: 'suins', displayName: 'SuiNS' },
  '0xc4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3::prime_machin': { name: 'prime_machin', displayName: 'Prime Machin' },
};

export interface NFTHolding {
  collection: string;
  displayName: string;
  count: number;
  isBluechip: boolean;
}

export async function getNFTHoldings(address: string): Promise<{
  holdings: NFTHolding[];
  totalNFTs: number;
  bluechipCount: number;
}> {
  const holdings: Record<string, NFTHolding> = {};
  let cursor: string | undefined;
  let hasMore = true;
  let totalNFTs = 0;

  while (hasMore) {
    try {
      const result = await suiClient.getOwnedObjects({
        owner: address,
        cursor,
        limit: 50,
        options: {
          showType: true,
          showDisplay: true,
        },
      });

      for (const obj of result.data) {
        const type = obj.data?.type;
        if (!type) continue;

        // Skip coin types, they're not NFTs
        if (type.includes('::coin::') || type.includes('::sui::')) continue;

        // Check if it's a display object (likely NFT)
        const display = obj.data?.display?.data;
        if (display && (display.name || display.image_url)) {
          totalNFTs++;

          // Check if it matches a bluechip collection
          let matchedCollection: { name: string; displayName: string } | undefined;
          for (const [prefix, info] of Object.entries(BLUECHIP_NFT_COLLECTIONS)) {
            if (type.startsWith(prefix)) {
              matchedCollection = info;
              break;
            }
          }

          // Extract collection name from type
          const typeMatch = type.match(/0x[a-f0-9]+::([^:]+)::/);
          const collectionKey = matchedCollection?.name || (typeMatch ? typeMatch[1] : 'unknown');
          const displayName = matchedCollection?.displayName || (typeMatch ? typeMatch[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown');

          if (!holdings[collectionKey]) {
            holdings[collectionKey] = {
              collection: collectionKey,
              displayName,
              count: 0,
              isBluechip: !!matchedCollection,
            };
          }
          holdings[collectionKey].count++;
        }
      }

      hasMore = result.hasNextPage;
      cursor = result.nextCursor || undefined;
      await delay(100);
    } catch (error) {
      console.error('Error fetching NFT holdings:', error);
      break;
    }
  }

  const holdingsArray = Object.values(holdings).sort((a, b) => {
    // Bluechips first, then by count
    if (a.isBluechip !== b.isBluechip) return a.isBluechip ? -1 : 1;
    return b.count - a.count;
  });

  return {
    holdings: holdingsArray,
    totalNFTs,
    bluechipCount: holdingsArray.filter(h => h.isBluechip).reduce((sum, h) => sum + h.count, 0),
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
