'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';
import { getProtocol } from '@/lib/constants';

interface ProtocolCardProps {
  data: WrappedData;
}

export function ProtocolCard({ data }: ProtocolCardProps) {
  // Sort protocols by transaction count
  const sortedProtocols = [...data.protocolBreakdown].sort(
    (a, b) => b.transactionCount - a.transactionCount
  );

  const topProtocol = sortedProtocols[0];
  // Show up to 6 other protocols (filling the grid)
  const otherProtocols = sortedProtocols.slice(1, 7);

  // Category colors
  const categoryColors: Record<string, string> = {
    dex: 'from-blue-500 to-cyan-500',
    lending: 'from-green-500 to-emerald-500',
    lst: 'from-amber-500 to-yellow-500',
    nft: 'from-purple-500 to-pink-500',
    bridge: 'from-orange-500 to-red-500',
    other: 'from-gray-500 to-slate-500',
  };

  // Get all protocols for display (max 6)
  const allProtocols = sortedProtocols.slice(0, 6);

  // No protocols
  if (allProtocols.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto h-full px-2">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white mb-6"
        >
          Protocol Universe
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <span className="text-4xl mb-3 block">🌐</span>
          <p className="text-white/70">No protocol activity detected</p>
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
        Protocol Universe
      </motion.h2>

      {/* Most used protocol */}
      {topProtocol && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`w-full bg-gradient-to-br ${categoryColors[topProtocol.category]} rounded-xl p-4 mb-4`}
        >
          <p className="text-white/70 text-xs mb-1">Most Used</p>
          <p className="text-white font-bold text-xl">{topProtocol.displayName}</p>
          <p className="text-white/80 text-sm">{topProtocol.transactionCount} transactions</p>
        </motion.div>
      )}

      {/* Other protocols grid */}
      {otherProtocols.length > 0 && (
        <div className="w-full grid grid-cols-2 gap-2 mb-4">
          {otherProtocols.map((protocol, index) => (
            <motion.div
              key={protocol.protocol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <p className="text-white font-medium text-sm truncate">
                {protocol.displayName}
              </p>
              <p className="text-white/50 text-xs">
                {protocol.transactionCount} txns
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Total protocols */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="w-full bg-white/5 rounded-xl p-4 border border-white/10"
      >
        <p className="text-white/60 text-xs mb-1">Total Protocols Used</p>
        <p className="text-2xl font-bold text-gradient-sui">
          {data.uniqueProtocols.length}
        </p>
      </motion.div>
    </div>
  );
}
