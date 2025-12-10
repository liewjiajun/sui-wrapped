'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';
import { formatNumber } from '@/lib/utils';

interface NumbersCardProps {
  data: WrappedData;
}

export function NumbersCard({ data }: NumbersCardProps) {
  const stats = [
    {
      label: 'TRANSACTIONS',
      value: data.totalTransactions,
    },
    {
      label: 'PROTOCOLS USED',
      value: data.uniqueProtocols.length,
    },
    {
      label: 'ACTIVE DAYS',
      value: data.activeDays,
    },
  ];

  // Calculate bar width based on percentage (relative to max value for visual effect)
  const getBarWidth = (value: number, maxValue: number) => {
    return Math.min((value / maxValue) * 100, 100);
  };

  const maxTx = 1000; // Assumed max for scaling
  const maxProtocols = 20;
  const maxDays = 365;

  const barMaxes = [maxTx, maxProtocols, maxDays];

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full h-full px-2">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-white mb-5"
      >
        Your 2025 in Numbers
      </motion.h2>

      {/* Stats */}
      <div className="w-full space-y-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <div className="mb-2">
              <span className="text-white/60 text-xs">{stat.label}</span>
            </div>

            {/* Animated bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getBarWidth(stat.value, barMaxes[index])}%` }}
                transition={{ delay: 0.4 + index * 0.15, duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[#4DA2FF] to-[#14B8A6] rounded-full"
              />
            </div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.15, duration: 0.3 }}
              className="text-2xl font-bold text-white"
            >
              {formatNumber(stat.value)}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
