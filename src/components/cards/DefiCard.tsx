'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';
import { formatCurrency, formatShortDate } from '@/lib/utils';

interface DefiCardProps {
  data: WrappedData;
}

export function DefiCard({ data }: DefiCardProps) {
  const { lendingMetrics } = data;

  // Health factor color and message
  const getHealthFactorStyle = (hf: number) => {
    if (hf < 1.05) return { color: 'text-red-400', message: 'Dangerously close!' };
    if (hf < 1.2) return { color: 'text-orange-400', message: 'Cutting it close!' };
    if (hf < 1.5) return { color: 'text-yellow-400', message: 'Living on the edge!' };
    return { color: 'text-green-400', message: 'Playing it safe!' };
  };

  const hfStyle = getHealthFactorStyle(lendingMetrics.minHealthFactor);

  // No lending activity - show minimal card
  if (lendingMetrics.totalSuppliedUsd === 0 && lendingMetrics.totalBorrowedUsd === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto h-full">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white mb-6"
        >
          DeFi Risk Profile
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <span className="text-4xl mb-3 block">🏦</span>
          <p className="text-white/70">No DeFi activity in 2025</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full h-full">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-white mb-4"
      >
        DeFi Risk Profile
      </motion.h2>

      {/* Lending Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full bg-white/5 rounded-xl p-3 border border-white/10 mb-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-green-400 text-xl font-bold">
              {formatCurrency(lendingMetrics.totalSuppliedUsd)}
            </p>
            <p className="text-white/50 text-xs">Supplied</p>
          </div>
          <div>
            <p className="text-orange-400 text-xl font-bold">
              {formatCurrency(lendingMetrics.totalBorrowedUsd)}
            </p>
            <p className="text-white/50 text-xs">Borrowed</p>
          </div>
        </div>
      </motion.div>

      {/* Health Factor Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30 mb-3"
      >
        <p className="text-white/70 text-xs mb-2">Lowest Health Factor</p>

        {/* Health Factor Visual */}
        <div className="relative h-6 bg-white/10 rounded-full overflow-hidden mb-2">
          <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-red-500/30" />
          <div className="absolute left-1/4 top-0 bottom-0 w-1/4 bg-orange-500/30" />
          <div className="absolute left-1/2 top-0 bottom-0 w-1/2 bg-green-500/30" />
          <motion.div
            initial={{ left: '100%' }}
            animate={{
              left: `${Math.min(Math.max((lendingMetrics.minHealthFactor / 3) * 100, 5), 95)}%`,
            }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50"
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className={`text-2xl font-bold ${hfStyle.color}`}>
            {lendingMetrics.minHealthFactor.toFixed(2)}
          </span>
        </div>
        <p className="text-white/60 text-xs mt-1">{hfStyle.message}</p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-full grid grid-cols-2 gap-2"
      >
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-white/60 text-xs">Liquidations</p>
          <p
            className={`text-lg font-bold ${
              lendingMetrics.liquidations === 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {lendingMetrics.liquidations}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-white/60 text-xs">Close Calls</p>
          <p className="text-lg font-bold text-orange-400">
            {lendingMetrics.closeCalls}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
