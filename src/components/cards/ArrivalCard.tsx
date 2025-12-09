'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';
import { formatDate } from '@/lib/utils';

interface ArrivalCardProps {
  data: WrappedData;
}

export function ArrivalCard({ data }: ArrivalCardProps) {
  const formattedDate = formatDate(data.firstTransactionTimestamp);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto h-full">
      {/* Animated droplet icon */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="mb-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4DA2FF] via-[#06B6D4] to-[#14B8A6] flex items-center justify-center shadow-lg glow-sui"
        >
          <svg
            className="w-10 h-10 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C12 2 4 10 4 14.5C4 18.09 7.58 21 12 21C16.42 21 20 18.09 20 14.5C20 10 12 2 12 2ZM12 19C8.69 19 6 16.54 6 14.5C6 12.06 9.33 7.06 12 4.13C14.67 7.06 18 12.06 18 14.5C18 16.54 15.31 19 12 19Z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-white/70 text-lg mb-3"
      >
        You joined Sui on
      </motion.p>

      {/* Date box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="bg-gradient-to-br from-[#4DA2FF]/20 to-[#14B8A6]/20 border border-[#4DA2FF]/30 rounded-2xl px-8 py-5 mb-5"
      >
        <p className="text-3xl md:text-4xl font-bold text-white">{formattedDate}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="space-y-2"
      >
        <p className="text-white/80">
          Day <span className="font-bold text-gradient-sui">{data.daysAfterMainnetLaunch}</span> of Mainnet
        </p>
        <p className="text-white/80">
          Earlier than{' '}
          <span className="font-bold text-gradient-sui">{data.earlierThanPercentage}%</span> of users
        </p>
      </motion.div>

      {/* Early Bird Badge */}
      {data.daysAfterMainnetLaunch <= 90 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-6 px-5 py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 rounded-full"
        >
          <span className="text-amber-300 font-semibold flex items-center gap-2">
            <span>🐦</span>
            Early Bird
          </span>
        </motion.div>
      )}
    </div>
  );
}
