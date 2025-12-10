'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';

interface DefiCardProps {
  data: WrappedData;
}

export function DefiCard({ data }: DefiCardProps) {
  const { protocolBreakdown, categoryBreakdown } = data;

  // Get lending protocols
  const lendingProtocols = protocolBreakdown
    .filter(p => p.category === 'lending')
    .slice(0, 4);

  // Get LST protocols
  const lstProtocols = protocolBreakdown
    .filter(p => p.category === 'lst')
    .slice(0, 4);

  const totalLendingTx = categoryBreakdown.lending.transactionCount;
  const totalLstTx = categoryBreakdown.lst.transactionCount;
  const totalDeFiTx = totalLendingTx + totalLstTx;

  // Determine DeFi profile
  const getDefiProfile = () => {
    if (totalDeFiTx === 0) {
      return { title: 'DeFi Explorer', emoji: '🔍', description: 'Ready to dive in' };
    }
    if (totalDeFiTx > 100) {
      return { title: 'DeFi Degen', emoji: '🔥', description: 'Living on-chain' };
    }
    if (totalDeFiTx > 50) {
      return { title: 'Yield Farmer', emoji: '🌾', description: 'Maximizing returns' };
    }
    if (totalDeFiTx > 20) {
      return { title: 'DeFi Enthusiast', emoji: '📈', description: 'Growing portfolio' };
    }
    if (totalLstTx > totalLendingTx) {
      return { title: 'Liquid Staker', emoji: '💧', description: 'Staking for yield' };
    }
    return { title: 'Lender', emoji: '🏦', description: 'Earning interest' };
  };

  const defiProfile = getDefiProfile();

  // No DeFi activity - show minimal card
  if (totalDeFiTx === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto h-full">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white mb-6"
        >
          DeFi Activity
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
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full h-full px-2">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-white mb-4"
      >
        DeFi Activity
      </motion.h2>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full grid grid-cols-2 gap-3 mb-4"
      >
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-3 border border-green-400/30">
          <p className="text-2xl font-bold text-green-400">{totalLendingTx}</p>
          <p className="text-white/50 text-xs">Lending Txns</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-3 border border-blue-400/30">
          <p className="text-2xl font-bold text-blue-400">{totalLstTx}</p>
          <p className="text-white/50 text-xs">LST Txns</p>
        </div>
      </motion.div>

      {/* Lending Protocols */}
      {lendingProtocols.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full mb-3"
        >
          <p className="text-white/60 text-xs mb-2 text-left">Lending Protocols</p>
          <div className="flex flex-wrap gap-2">
            {lendingProtocols.map((protocol, index) => (
              <motion.div
                key={protocol.protocol}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                className="bg-green-500/10 border border-green-400/30 rounded-lg px-3 py-2"
              >
                <p className="text-white font-medium text-sm">{protocol.displayName}</p>
                <p className="text-green-400/70 text-xs">{protocol.transactionCount} txns</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* LST Protocols */}
      {lstProtocols.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full mb-4"
        >
          <p className="text-white/60 text-xs mb-2 text-left">Liquid Staking</p>
          <div className="flex flex-wrap gap-2">
            {lstProtocols.map((protocol, index) => (
              <motion.div
                key={protocol.protocol}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                className="bg-blue-500/10 border border-blue-400/30 rounded-lg px-3 py-2"
              >
                <p className="text-white font-medium text-sm">{protocol.displayName}</p>
                <p className="text-blue-400/70 text-xs">{protocol.transactionCount} txns</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DeFi Profile Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="w-full bg-white/5 rounded-xl p-4 border border-white/10"
      >
        <span className="text-3xl mb-2 block">{defiProfile.emoji}</span>
        <p className="text-lg font-bold text-white">{defiProfile.title}</p>
        <p className="text-white/50 text-xs mt-1">{defiProfile.description}</p>
      </motion.div>
    </div>
  );
}
