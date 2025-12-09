'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';
import { formatNumber } from '@/lib/utils';

interface StakingCardProps {
  data: WrappedData;
}

export function StakingCard({ data }: StakingCardProps) {
  const { stakingMetrics } = data;

  // No staking activity
  if (stakingMetrics.totalStakedSui === 0) {
    return (
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white mb-8"
        >
          Staking Commitment
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full bg-white/5 rounded-xl p-8 border border-white/10"
        >
          <span className="text-5xl mb-4 block">🪙</span>
          <p className="text-white/70 text-lg">No staking activity in 2025</p>
          <p className="text-white/50 text-sm mt-2">
            Stake SUI or try liquid staking with afSUI, haSUI, or vSUI!
          </p>
        </motion.div>
      </div>
    );
  }

  // LST colors
  const lstColors: Record<string, string> = {
    afSUI: 'from-purple-500 to-pink-500',
    haSUI: 'from-blue-500 to-cyan-500',
    vSUI: 'from-green-500 to-emerald-500',
    SUI: 'from-cyan-500 to-blue-500',
  };

  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto w-full">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold text-white mb-8"
      >
        Staking Commitment
      </motion.h2>

      {/* Main stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-5 border border-amber-400/30 mb-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/60 text-sm mb-1">Total Staked</p>
            <p className="text-2xl font-bold text-white">
              {formatNumber(stakingMetrics.totalStakedSui, 0)} SUI
            </p>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-1">Rewards Earned</p>
            <p className="text-2xl font-bold text-green-400">
              +{formatNumber(stakingMetrics.totalRewardsEarned, 2)} SUI
            </p>
          </div>
        </div>
      </motion.div>

      {/* LST Portfolio */}
      {stakingMetrics.lstPortfolio.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full mb-6"
        >
          <p className="text-white/60 text-sm mb-3 text-left">LST Portfolio</p>

          <div className="space-y-3">
            {stakingMetrics.lstPortfolio.map((lst, index) => (
              <motion.div
                key={lst.token}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                className="bg-white/5 rounded-xl p-3 border border-white/10"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{lst.displayName}</span>
                  <span className="text-white/60 text-sm">
                    {lst.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lst.percentage}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                    className={`h-full bg-gradient-to-r ${
                      lstColors[lst.token] || lstColors.SUI
                    }`}
                  />
                </div>
                <p className="text-white/40 text-xs mt-1 text-right">
                  {formatNumber(lst.amount, 2)} {lst.token}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Longest stake */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="w-full bg-white/5 rounded-xl p-4 border border-white/10 mb-4"
      >
        <p className="text-white/60 text-sm mb-1">Longest Stake Duration</p>
        <p className="text-2xl font-bold text-white">
          {stakingMetrics.longestStakeDays} days
        </p>
        {stakingMetrics.isStillHolding && (
          <p className="text-cyan-400 text-sm mt-1">Still holding! 💎🙌</p>
        )}
      </motion.div>

      {/* Diamond hands badge */}
      {stakingMetrics.longestStakeDays >= 180 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 rounded-full"
        >
          <span className="text-cyan-300 font-semibold flex items-center gap-2">
            <span>💎</span>
            Diamond Hand Certified
          </span>
        </motion.div>
      )}
    </div>
  );
}
