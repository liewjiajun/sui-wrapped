'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';

interface TradingCardProps {
  data: WrappedData;
}

export function TradingCard({ data }: TradingCardProps) {
  const { tradingMetrics, protocolBreakdown, categoryBreakdown } = data;

  // Get DEX protocols
  const dexProtocols = protocolBreakdown
    .filter(p => p.category === 'dex')
    .slice(0, 4);

  const totalDexTx = categoryBreakdown.dex.transactionCount;

  // Determine trading style based on DEX activity
  const getTradingStyle = () => {
    if (tradingMetrics.swapCount === 0) {
      return { title: 'DEX Explorer', emoji: '🔍', description: 'Just getting started' };
    }
    if (tradingMetrics.swapCount > 100) {
      return { title: 'Power Trader', emoji: '⚡', description: 'High frequency swapper' };
    }
    if (tradingMetrics.swapCount > 50) {
      return { title: 'Active Trader', emoji: '📊', description: 'Regular DEX user' };
    }
    if (tradingMetrics.swapCount > 10) {
      return { title: 'Casual Trader', emoji: '🎯', description: 'Strategic swapper' };
    }
    return { title: 'Occasional Trader', emoji: '⚖️', description: 'Selective swaps' };
  };

  const tradingStyle = getTradingStyle();

  // No DEX activity - show minimal card
  if (tradingMetrics.swapCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto h-full">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white mb-6"
        >
          Trading Style
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <span className="text-4xl mb-3 block">💱</span>
          <p className="text-white/70">No DEX swaps in 2025</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full h-full px-2">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-white mb-4"
      >
        Trading Style
      </motion.h2>

      {/* Total Swaps */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full bg-gradient-to-br from-[#4DA2FF]/20 to-[#14B8A6]/20 rounded-xl p-4 border border-[#4DA2FF]/30 mb-4"
      >
        <p className="text-white/60 text-xs mb-1">Total DEX Swaps</p>
        <p className="text-4xl font-bold text-gradient-sui">
          {tradingMetrics.swapCount.toLocaleString()}
        </p>
      </motion.div>

      {/* DEX Breakdown */}
      {dexProtocols.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full mb-4"
        >
          <p className="text-white/60 text-xs mb-2 text-left">Favorite DEXes</p>
          <div className="grid grid-cols-2 gap-2">
            {dexProtocols.map((protocol, index) => (
              <motion.div
                key={protocol.protocol}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                className="bg-white/5 rounded-lg p-2 border border-white/10"
              >
                <p className="text-white font-medium text-sm truncate">{protocol.displayName}</p>
                <p className="text-white/50 text-xs">{protocol.transactionCount} swaps</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trading Style Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="w-full bg-white/5 rounded-xl p-4 border border-white/10"
      >
        <span className="text-3xl mb-2 block">{tradingStyle.emoji}</span>
        <p className="text-lg font-bold text-white">{tradingStyle.title}</p>
        <p className="text-white/50 text-xs mt-1">{tradingStyle.description}</p>
      </motion.div>
    </div>
  );
}
