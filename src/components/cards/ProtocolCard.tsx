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

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full h-full">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-white mb-5"
      >
        Protocol Universe
      </motion.h2>

      {/* Central protocol (most used) */}
      {topProtocol && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative mb-4"
        >
          {/* Glow effect */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              categoryColors[topProtocol.category]
            } rounded-full blur-xl opacity-50`}
          />

          <div
            className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${
              categoryColors[topProtocol.category]
            } flex items-center justify-center`}
          >
            <div className="text-center">
              <p className="text-white font-bold text-sm">
                {topProtocol.displayName}
              </p>
              <p className="text-white/70 text-xs">
                {topProtocol.transactionCount} txns
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-2 py-0.5 rounded-full"
          >
            <span className="text-[10px] text-white/80">Most Used</span>
          </motion.div>
        </motion.div>
      )}

      {/* Orbiting protocols */}
      <div className="w-full grid grid-cols-3 gap-2 mb-4">
        {otherProtocols.map((protocol, index) => (
          <motion.div
            key={protocol.protocol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            className={`p-2 rounded-lg bg-gradient-to-br ${
              categoryColors[protocol.category]
            } bg-opacity-20 border border-white/10`}
            style={{
              background: `linear-gradient(135deg, ${
                protocol.category === 'dex'
                  ? 'rgba(59,130,246,0.2)'
                  : protocol.category === 'lending'
                  ? 'rgba(34,197,94,0.2)'
                  : protocol.category === 'lst'
                  ? 'rgba(245,158,11,0.2)'
                  : protocol.category === 'nft'
                  ? 'rgba(168,85,247,0.2)'
                  : 'rgba(107,114,128,0.2)'
              }, transparent)`,
            }}
          >
            <p className="text-white font-medium text-xs truncate">
              {protocol.displayName}
            </p>
            <p className="text-white/50 text-[10px]">
              {protocol.transactionCount} txns
            </p>
          </motion.div>
        ))}
      </div>

      {/* Discovery stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="w-full bg-white/5 rounded-xl p-3 border border-white/10"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/60 text-xs">Protocols</p>
            <p className="text-xl font-bold text-white">
              {data.uniqueProtocols.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Most Active In</p>
            <p className="text-lg font-semibold text-gradient-sui capitalize">
              {topProtocol?.category || 'DeFi'}
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
