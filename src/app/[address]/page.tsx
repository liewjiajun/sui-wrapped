'use client';

import { useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWrappedData } from '@/hooks/useWrappedData';
import { useFluidParams } from '@/hooks/useFluidParams';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useWrappedStore } from '@/stores/wrappedStore';
import { isValidSuiAddress } from '@/lib/utils';
import {
  ProgressDots,
  ArrivalCard,
  NumbersCard,
  GasSaviorCard,
  ProtocolCard,
  TradingCard,
  DefiCard,
  PersonaCard,
} from '@/components/cards';
import { ShareModal } from '@/components/share/ShareModal';
import { LOADING_MESSAGES } from '@/types/wrapped';

const TOTAL_CARDS = 7;

export default function WrappedPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const {
    currentCardIndex,
    setCurrentCardIndex,
    nextCard,
    prevCard,
    isAudioEnabled,
    toggleAudio,
    loadingMessage,
  } = useWrappedStore();

  // Validate address
  useEffect(() => {
    if (!isValidSuiAddress(address)) {
      router.push('/');
    }
  }, [address, router]);

  // Fetch wrapped data
  const { data, error, isLoading } = useWrappedData(address);

  // Initialize fluid params
  const fluidParams = useFluidParams(data);

  // Initialize audio engine
  const { isPlaying } = useAudioEngine(data);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        prevCard();
      }
    },
    [nextCard, prevCard]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle touch navigation
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.3) {
      prevCard();
    } else {
      nextCard();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen fluid-gradient flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Animated droplet */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center"
          >
            <svg
              className="w-12 h-12 text-white animate-pulse"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C12 2 4 10 4 14.5C4 18.09 7.58 21 12 21C16.42 21 20 18.09 20 14.5C20 10 12 2 12 2Z" />
            </svg>
          </motion.div>

          {/* Loading message */}
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-white/80 text-lg mb-4"
            >
              {loadingMessage || LOADING_MESSAGES[0]}
            </motion.p>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 8, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen fluid-gradient flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">😕</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {error || 'No data found'}
          </h2>
          <p className="text-white/60 mb-8">
            We couldn't find any activity for this address in 2025.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/15 transition-all"
          >
            Try Another Address
          </button>
        </div>
      </div>
    );
  }

  // Card components
  const cards = [
    <ArrivalCard key="arrival" data={data} />,
    <NumbersCard key="numbers" data={data} />,
    <GasSaviorCard key="gas" data={data} />,
    <ProtocolCard key="protocol" data={data} />,
    <TradingCard key="trading" data={data} />,
    <DefiCard key="defi" data={data} />,
    <PersonaCard key="persona" data={data} />,
  ];

  return (
    <div className="min-h-screen fluid-gradient">
      {/* Dynamic background based on fluid params */}
      <div
        className="fixed inset-0 transition-all duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, hsla(${fluidParams.hue}, ${fluidParams.saturation}%, ${fluidParams.brightness}%, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 70% 70%, hsla(${(fluidParams.hue + 60) % 360}, ${fluidParams.saturation}%, ${fluidParams.brightness - 10}%, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Main content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Story Container */}
        <div
          className="story-container bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-2xl cursor-pointer no-select"
          onClick={handleTap}
        >
          {/* Progress dots */}
          <div className="absolute top-6 left-6 right-6 z-10">
            <ProgressDots total={TOTAL_CARDS} current={currentCardIndex} />
          </div>

          {/* Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center p-6 pt-16"
            >
              {cards[currentCardIndex]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation hints */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-white/30 text-xs">
            <span>{currentCardIndex > 0 ? '← Tap left' : ''}</span>
            <span>{currentCardIndex < TOTAL_CARDS - 1 ? 'Tap right →' : ''}</span>
          </div>
        </div>

        {/* Card counter */}
        <div className="mt-4 text-white/40 text-sm">
          {currentCardIndex + 1} / {TOTAL_CARDS}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal data={data} />
    </div>
  );
}
