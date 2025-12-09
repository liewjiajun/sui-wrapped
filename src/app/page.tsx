'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { isValidSuiAddress } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const [manualAddress, setManualAddress] = useState('');
  const [error, setError] = useState('');

  // If wallet is connected, redirect to their wrapped page
  const handleConnectedWallet = () => {
    if (currentAccount?.address) {
      router.push(`/${currentAccount.address}`);
    }
  };

  // Handle manual address submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedAddress = manualAddress.trim();

    if (!trimmedAddress) {
      setError('Please enter an address');
      return;
    }

    if (!isValidSuiAddress(trimmedAddress)) {
      setError('Invalid Sui address format');
      return;
    }

    router.push(`/${trimmedAddress}`);
  };

  return (
    <main className="min-h-screen fluid-gradient-sui flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-10 w-[32rem] h-[32rem] bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12 relative z-10">
        {/* Animated Logo/Droplet */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#4DA2FF] via-[#06B6D4] to-[#14B8A6] flex items-center justify-center glow-sui">
              <svg
                className="w-14 h-14 md:w-16 md:h-16 text-white drop-shadow-2xl"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C12 2 4 10 4 14.5C4 18.09 7.58 21 12 21C16.42 21 20 18.09 20 14.5C20 10 12 2 12 2ZM12 19C8.69 19 6 16.54 6 14.5C6 12.06 9.33 7.06 12 4.13C14.67 7.06 18 12.06 18 14.5C18 16.54 15.31 19 12 19Z" />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8 px-6 md:px-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.15]">
            Your Year on{' '}
            <span className="text-gradient-sui">Sui</span>
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="inline-block px-8 py-3 glass-strong rounded-full"
          >
            <p className="text-base sm:text-lg md:text-xl text-gradient-rainbow font-semibold whitespace-nowrap">
              2025 in Review
            </p>
          </motion.div>
        </motion.div>


        {/* Connect Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full max-w-lg space-y-6 px-6 md:px-8"
        >
          {/* Connect Wallet Button */}
          <div className="flex flex-col items-center gap-4">
            {currentAccount ? (
              <button
                onClick={handleConnectedWallet}
                className="w-full py-5 px-8 bg-gradient-to-r from-[#4DA2FF] via-[#06B6D4] to-[#14B8A6] text-white text-lg font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 glow-sui transform hover:scale-[1.02] relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  View My Wrapped
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            ) : (
              <ConnectButton
                className="w-full justify-center py-5 text-lg font-bold"
                variant="primary"
              />
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <span className="text-white/50 text-sm font-medium px-2">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>

          {/* Manual Address Input */}
          <form onSubmit={handleManualSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4DA2FF] via-[#06B6D4] to-[#14B8A6] rounded-2xl opacity-30 group-hover:opacity-50 blur transition duration-300" />
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter any Sui address (0x...)"
                className="relative w-full px-6 py-5 bg-slate-900/90 border border-blue-500/30 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:border-blue-400/70 focus:ring-2 focus:ring-blue-400/30 transition-all font-mono text-sm md:text-base backdrop-blur-xl"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-5 bg-white/10 border border-blue-400/30 text-white font-semibold rounded-2xl hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-xl hover:scale-[1.02] transform text-base md:text-lg"
            >
              Look Up Address
            </button>
          </form>

          {/* Privacy Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex items-center justify-center gap-2 text-white/50 text-sm py-2"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-center">
              Public on-chain data only · No signatures required
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer - Neon Credit */}
      <footer className="py-6 px-4 relative z-10 mt-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center"
        >
          <p className="text-white/50 text-sm">
            Vibe coded poorly by{' '}
            <a
              href="https://x.com/jjonlydown"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold neon-text hover:opacity-80 transition-opacity"
            >
              @jjonlydown
            </a>
          </p>
        </motion.div>
      </footer>
    </main>
  );
}
