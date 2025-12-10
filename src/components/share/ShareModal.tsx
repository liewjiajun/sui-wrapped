'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useWrappedStore } from '@/stores/wrappedStore';
import type { WrappedData } from '@/types/wrapped';
import { PERSONA_COPY } from '@/types/wrapped';
import { SHARE_TEMPLATES } from '@/lib/constants';
import { formatCurrency, buildTwitterShareUrl, copyToClipboard, downloadImage } from '@/lib/utils';

// Screen definitions for the selector
const SCREEN_OPTIONS = [
  { id: 'all', label: 'All Screens', emoji: '📊' },
  { id: 'arrival', label: 'Join Date', emoji: '📅' },
  { id: 'numbers', label: 'Numbers', emoji: '📈' },
  { id: 'gas', label: 'Gas Savings', emoji: '⛽' },
  { id: 'protocols', label: 'Protocols', emoji: '🌐' },
  { id: 'trading', label: 'Trading', emoji: '💱' },
  { id: 'defi', label: 'DeFi', emoji: '🏦' },
  { id: 'nft', label: 'NFTs', emoji: '🖼️' },
  { id: 'persona', label: 'Persona', emoji: '🎭' },
] as const;

type ScreenId = typeof SCREEN_OPTIONS[number]['id'];

interface ShareModalProps {
  data: WrappedData;
}

export function ShareModal({ data }: ShareModalProps) {
  const { isShareModalOpen, setIsShareModalOpen } = useWrappedStore();

  const [copied, setCopied] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<ScreenId>('persona');

  const personaCopy = PERSONA_COPY[data.persona];

  const getShareUrl = () => {
    return `https://wrapped.sui.io/${data.address}`;
  };

  const getOgImageUrl = () => {
    // Use relative URL for preview
    const url = new URL(`/api/wrapped/${data.address}/og`, window.location.origin);

    // Map screen selections to parameters
    switch (selectedScreen) {
      case 'all':
        url.searchParams.set('persona', 'true');
        url.searchParams.set('gas', 'true');
        url.searchParams.set('tx', 'true');
        break;
      case 'persona':
        url.searchParams.set('persona', 'true');
        url.searchParams.set('gas', 'false');
        url.searchParams.set('tx', 'false');
        break;
      case 'gas':
        url.searchParams.set('persona', 'false');
        url.searchParams.set('gas', 'true');
        url.searchParams.set('tx', 'false');
        break;
      case 'numbers':
        url.searchParams.set('persona', 'false');
        url.searchParams.set('gas', 'false');
        url.searchParams.set('tx', 'true');
        break;
      default:
        // For other screens, show persona by default
        url.searchParams.set('persona', 'true');
        url.searchParams.set('gas', 'false');
        url.searchParams.set('tx', 'false');
    }

    return url.toString();
  };

  const getTwitterText = () => {
    const lines: string[] = [];

    lines.push(
      SHARE_TEMPLATES.twitter.persona(personaCopy.title, personaCopy.emoji)
    );

    // Add context based on selected screen
    if (selectedScreen === 'gas' || selectedScreen === 'all') {
      lines.push(
        SHARE_TEMPLATES.twitter.gasSaved(
          formatCurrency(data.gasSavings.savingsUsd)
        )
      );
    }

    if (selectedScreen === 'numbers' || selectedScreen === 'all') {
      lines.push(
        SHARE_TEMPLATES.twitter.transactions(
          data.totalTransactions.toLocaleString()
        )
      );
    }

    if (selectedScreen === 'protocols' || selectedScreen === 'all') {
      lines.push(SHARE_TEMPLATES.twitter.protocols(data.uniqueProtocols.length));
    }

    lines.push(SHARE_TEMPLATES.twitter.footer);

    return lines.join('');
  };

  const handleShareTwitter = () => {
    const twitterUrl = buildTwitterShareUrl(getTwitterText(), getShareUrl());
    window.open(twitterUrl, '_blank');
  };

  const handleCopyLink = async () => {
    await copyToClipboard(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    await downloadImage(
      getOgImageUrl(),
      `sui-wrapped-2025-${selectedScreen}-${data.address.slice(0, 8)}.png`
    );
  };

  return (
    <Dialog.Root open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
      <AnimatePresence>
        {isShareModalOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl p-6 z-50 border border-white/10 shadow-xl"
              >
                {/* Header */}
                <Dialog.Title className="text-xl font-bold text-white mb-4">
                  Share Your Wrapped
                </Dialog.Title>

                {/* Screen Selector */}
                <div className="mb-5">
                  <p className="text-white/60 text-sm mb-3">Choose screen to share:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {SCREEN_OPTIONS.map((screen) => (
                      <button
                        key={screen.id}
                        onClick={() => setSelectedScreen(screen.id)}
                        className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                          selectedScreen === screen.id
                            ? 'bg-gradient-to-br from-[#4DA2FF]/30 to-[#14B8A6]/30 border border-[#4DA2FF]/50'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg mb-1">{screen.emoji}</span>
                        <span className="text-[10px] text-white/70 truncate w-full text-center">
                          {screen.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="mb-5">
                  <p className="text-white/60 text-sm mb-2">Preview:</p>
                  <div className="rounded-xl overflow-hidden bg-slate-800 border border-white/10 aspect-[1200/630]">
                    <img
                      src={getOgImageUrl()}
                      alt="Share preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleShareTwitter}
                    className="flex-1 py-3 bg-[#1DA1F2] text-white font-semibold rounded-xl hover:bg-[#1a8cd8] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    {copied ? '✓' : '📋'}
                  </button>

                  <button
                    onClick={handleDownloadImage}
                    className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    ⬇️
                  </button>
                </div>

                {/* Close button */}
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
                    aria-label="Close"
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
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
