'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';
import { formatCurrency, formatNumber, mistToSui } from '@/lib/utils';

interface GasSaviorCardProps {
  data: WrappedData;
}

export function GasSaviorCard({ data }: GasSaviorCardProps) {
  const { gasSavings } = data;
  const suiSpent = mistToSui(BigInt(gasSavings.totalSuiGasSpent));

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto h-full px-2">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-white mb-1"
      >
        Gas Savior
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-white/60 text-sm mb-4"
      >
        Thanks to Sui's low fees
      </motion.p>

      {/* Sui gas spent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full bg-white/5 rounded-xl p-4 border border-white/10 mb-3"
      >
        <p className="text-white/60 text-xs mb-1">Total Gas Spent on Sui</p>
        <p className="text-2xl font-bold text-white">
          {suiSpent.toFixed(4)} SUI
        </p>
        <p className="text-white/50 text-xs">
          ~{formatCurrency(gasSavings.totalSuiGasUsd)}
        </p>
      </motion.div>

      {/* ETH equivalent */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full bg-white/5 rounded-xl p-4 border border-white/10 mb-4"
      >
        <p className="text-white/60 text-xs mb-1">If this were Ethereum...</p>
        <p className="text-2xl font-bold text-red-400 line-through decoration-2">
          {formatCurrency(gasSavings.hypotheticalEthGasUsd)}
        </p>
      </motion.div>

      {/* Savings highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xl">💰</span>
          <span className="text-white/80">YOU SAVED</span>
        </div>
        <motion.p
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, duration: 0.3, type: 'spring' }}
          className="text-3xl md:text-4xl font-bold text-green-400"
        >
          {formatCurrency(gasSavings.savingsUsd)}
        </motion.p>
        <p className="text-white/60 text-sm mt-1">
          <span className="text-xl font-bold text-gradient-sui">{formatNumber(gasSavings.savingsMultiple, 0)}x</span> cheaper
        </p>
      </motion.div>
    </div>
  );
}
