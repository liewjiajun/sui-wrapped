'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';

interface NFTCardProps {
  data: WrappedData;
}

export function NFTCard({ data }: NFTCardProps) {
  const { nftHoldings } = data;

  // Handle missing nftHoldings data
  if (!nftHoldings || !nftHoldings.holdings) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto h-full">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white mb-6"
        >
          NFT Collection
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <span className="text-4xl mb-3 block">🖼️</span>
          <p className="text-white/70">No NFT data available</p>
        </motion.div>
      </div>
    );
  }

  // Show top 6 collections
  const topCollections = nftHoldings.holdings.slice(0, 6);

  // No NFTs - show minimal card
  if (nftHoldings.totalNFTs === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto h-full">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white mb-6"
        >
          NFT Collection
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <span className="text-4xl mb-3 block">🖼️</span>
          <p className="text-white/70">No NFTs found in wallet</p>
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
        NFT Collection
      </motion.h2>

      {/* Total NFTs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30 mb-4"
      >
        <p className="text-4xl font-bold text-gradient-sui">{nftHoldings.totalNFTs}</p>
        <p className="text-white/50 text-sm">Total NFTs</p>
      </motion.div>

      {/* Collection grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="w-full"
      >
        <p className="text-white/60 text-xs mb-2 text-left">Your Collections</p>
        <div className="grid grid-cols-2 gap-2">
          {topCollections.map((collection, index) => (
            <motion.div
              key={collection.collection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              className="p-3 rounded-lg border bg-white/5 border-white/10"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🖼️</span>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-white font-medium text-xs truncate">{collection.displayName}</p>
                  <p className="text-white/50 text-[10px]">{collection.count} item{collection.count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* More collections indicator */}
      {nftHoldings.holdings.length > 6 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-white/40 text-xs mt-3"
        >
          +{nftHoldings.holdings.length - 6} more collections
        </motion.p>
      )}
    </div>
  );
}
