'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useWrappedStore } from '@/stores/wrappedStore';

interface StoryCardWrapperProps {
  children: ReactNode;
  index: number;
}

export function StoryCardWrapper({ children, index }: StoryCardWrapperProps) {
  const { currentCardIndex } = useWrappedStore();
  const isActive = currentCardIndex === index;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Progress indicator dots
export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 bg-white'
              : i < current
              ? 'w-1.5 bg-white/60'
              : 'w-1.5 bg-white/30'
          }`}
          initial={false}
          animate={{
            width: i === current ? 24 : 6,
            backgroundColor:
              i === current
                ? 'rgba(255,255,255,1)'
                : i < current
                ? 'rgba(255,255,255,0.6)'
                : 'rgba(255,255,255,0.3)',
          }}
        />
      ))}
    </div>
  );
}

// Animated number counter
export function AnimatedNumber({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {value.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  );
}

// Stat box component
export function StatBox({
  label,
  value,
  subtext,
  highlight = false,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-4 rounded-xl ${
        highlight
          ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30'
          : 'bg-white/5 border border-white/10'
      }`}
    >
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="text-white/50 text-xs mt-1">{subtext}</p>}
    </motion.div>
  );
}

// Swipe indicator
export function SwipeIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-white/40 text-sm"
      >
        Swipe up for details
      </motion.div>
      <motion.svg
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-5 h-5 text-white/40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </motion.svg>
    </motion.div>
  );
}
