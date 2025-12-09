'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';
import { formatCurrency, formatPercentage, formatShortDate } from '@/lib/utils';

interface TradingCardProps {
  data: WrappedData;
}

export function TradingCard({ data }: TradingCardProps) {
  const { tradingMetrics } = data;

  const makerPercentage =
    tradingMetrics.totalVolumeUsd > 0
      ? (tradingMetrics.makerVolumeUsd / tradingMetrics.totalVolumeUsd) * 100
      : 0;

  const takerPercentage = 100 - makerPercentage;

  // Determine trading style
  const getTradingStyle = () => {
    if (makerPercentage > 70) return { title: 'Patient Limit Order Sniper', emoji: '🎯' };
    if (makerPercentage > 50) return { title: 'Strategic Swing Trader', emoji: '📊' };
    if (takerPercentage > 70) return { title: 'Decisive Market Mover', emoji: '⚡' };
    return { title: 'Balanced Trader', emoji: '⚖️' };
  };

  const tradingStyle = getTradingStyle();

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full h-full">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-white mb-4"
      >
        Trading Style
      </motion.h2>

      {/* Total Volume */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full bg-white/5 rounded-xl p-3 border border-white/10 mb-4"
      >
        <p className="text-white/60 text-xs mb-1">DEX Volume</p>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(tradingMetrics.totalVolumeUsd)}
        </p>
        <p className="text-white/40 text-xs">
          {tradingMetrics.swapCount} swaps
        </p>
      </motion.div>

      {/* Maker vs Taker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full mb-4"
      >
        <div className="flex justify-between mb-1">
          <span className="text-white/70 text-xs">Maker</span>
          <span className="text-white/70 text-xs">Taker</span>
        </div>

        {/* Combined bar */}
        <div className="h-3 rounded-full overflow-hidden flex bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${makerPercentage}%` }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${takerPercentage}%` }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="h-full bg-gradient-to-r from-[#4DA2FF] to-[#14B8A6]"
          />
        </div>

        <div className="flex justify-between mt-1">
          <div className="text-left">
            <p className="text-green-400 font-bold text-sm">
              {formatCurrency(tradingMetrics.makerVolumeUsd)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gradient-sui font-bold text-sm">
              {formatCurrency(tradingMetrics.takerVolumeUsd)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Trading Style Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="w-full bg-gradient-to-br from-[#4DA2FF]/20 to-[#14B8A6]/20 rounded-xl p-4 border border-[#4DA2FF]/30"
      >
        <span className="text-2xl mb-1 block">{tradingStyle.emoji}</span>
        <p className="text-lg font-bold text-white">{tradingStyle.title}</p>
      </motion.div>

      {/* Best Trade */}
      {tradingMetrics.bestTradePercentGain > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="w-full bg-white/5 rounded-xl p-3 border border-white/10 mt-3"
        >
          <p className="text-white/60 text-xs mb-1">Best Trade</p>
          <p className="text-xl font-bold text-green-400">
            +{formatPercentage(tradingMetrics.bestTradePercentGain, 0)}
          </p>
        </motion.div>
      )}
    </div>
  );
}
