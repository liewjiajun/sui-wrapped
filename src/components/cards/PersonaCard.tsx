'use client';

import { motion } from 'framer-motion';
import type { WrappedData } from '@/types/wrapped';
import { PERSONA_COPY } from '@/types/wrapped';
import { useWrappedStore } from '@/stores/wrappedStore';

interface PersonaCardProps {
  data: WrappedData;
}

export function PersonaCard({ data }: PersonaCardProps) {
  const { setIsShareModalOpen } = useWrappedStore();
  const personaCopy = PERSONA_COPY[data.persona];

  // Persona-specific gradient colors - Enhanced with Sui brand colors
  const personaGradients: Record<string, string> = {
    move_maximalist: 'from-purple-500 via-fuchsia-500 to-pink-600',
    diamond_hand: 'from-[#4DA2FF] via-[#06B6D4] to-[#14B8A6]',
    yield_architect: 'from-emerald-400 via-teal-500 to-cyan-500',
    jpeg_mogul: 'from-pink-500 via-purple-600 to-violet-600',
    early_bird: 'from-amber-400 via-orange-500 to-rose-500',
    balanced_builder: 'from-[#4DA2FF] via-[#06B6D4] to-[#14B8A6]',
  };

  const gradient = personaGradients[data.persona] || personaGradients.balanced_builder;

  // Glow colors for different personas
  const personaGlows: Record<string, string> = {
    move_maximalist: 'glow-purple',
    diamond_hand: 'glow-sui',
    yield_architect: 'glow-teal',
    jpeg_mogul: 'glow-pink',
    early_bird: 'glow-blue',
    balanced_builder: 'glow-cyan',
  };

  const glowClass = personaGlows[data.persona] || 'glow-sui';

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto w-full h-full px-2">
      {/* Pre-title */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-white/70 text-lg font-medium mb-3"
      >
        You Are...
      </motion.p>

      {/* Persona card with enhanced visuals */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ delay: 0.3, duration: 0.8, type: 'spring', bounce: 0.4 }}
        className="w-full relative group mb-4"
      >
        {/* Animated glow border */}
        <div className={`absolute -inset-0.5 bg-gradient-to-br ${gradient} rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition duration-500 ${glowClass}`} />

        {/* Main card */}
        <div className={`relative w-full bg-gradient-to-br ${gradient} rounded-2xl p-[2px] shadow-2xl`}>
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5">
            {/* Emoji with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.6, type: 'spring' }}
              className="text-5xl mb-3"
            >
              {personaCopy.emoji}
            </motion.div>

            {/* Title with enhanced gradient */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className={`text-2xl md:text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3 leading-tight`}
            >
              {personaCopy.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="text-white/80 text-sm leading-relaxed"
            >
              {personaCopy.description}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Share button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
        className="w-full"
      >
        <button
          onClick={() => setIsShareModalOpen(true)}
          className={`group relative w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r ${gradient} hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden transform hover:scale-[1.02]`}
        >
          <span className="relative z-10 flex items-center gap-3">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Your Wrapped
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>
      </motion.div>

    </div>
  );
}
