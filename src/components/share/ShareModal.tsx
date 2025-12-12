'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useWrappedStore } from '@/stores/wrappedStore';
import type { WrappedData } from '@/types/wrapped';
import { PERSONA_COPY } from '@/types/wrapped';
import { SHARE_TEMPLATES } from '@/lib/constants';
import { buildTwitterShareUrl, copyToClipboard, downloadImage } from '@/lib/utils';

interface ShareModalProps {
  data: WrappedData;
}

export function ShareModal({ data }: ShareModalProps) {
  const { isShareModalOpen, setIsShareModalOpen } = useWrappedStore();
  const [copied, setCopied] = useState(false);

  const personaCopy = PERSONA_COPY[data.persona];

  const getShareUrl = () => {
    return `https://suiwrapped-2025.vercel.app/${data.address}`;
  };

  const getOgImageUrl = () => {
    const url = new URL(`/api/wrapped/${data.address}/og`, window.location.origin);
    url.searchParams.set('screen', 'overview');
    return url.toString();
  };

  const getTwitterText = () => {
    const lines: string[] = [];

    lines.push(
      SHARE_TEMPLATES.twitter.persona(personaCopy.title, personaCopy.emoji)
    );

    lines.push(`\n📊 ${data.totalTransactions.toLocaleString()} txns | ${data.uniqueProtocols.length} protocols | ${data.activeDays} active days`);

    lines.push(SHARE_TEMPLATES.twitter.footer);

    return lines.join('');
  };

  const handleShareTwitter = () => {
    // Only include tweet text, no address URL
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    twitterUrl.searchParams.set('text', getTwitterText());
    window.open(twitterUrl.toString(), '_blank');
  };

  const handleCopyLink = async () => {
    await copyToClipboard(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    await downloadImage(
      getOgImageUrl(),
      `sui-wrapped-2025-${data.address.slice(0, 8)}.png`
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

                {/* Preview */}
                <div className="mb-4">
                  <p className="text-white/60 text-sm mb-2">Preview:</p>
                  <div className="rounded-xl overflow-hidden bg-slate-800 border border-white/10 aspect-[2/1] relative">
                    <img
                      src={getOgImageUrl()}
                      alt="Share preview"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-blue-300 text-sm">
                    <span className="font-semibold">Tip:</span> Save the image first, then share on X and attach it to your post!
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadImage}
                    className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>⬇️</span>
                    Save Image
                  </button>

                  <button
                    onClick={handleShareTwitter}
                    className="flex-1 py-3 bg-[#1DA1F2] text-white font-semibold rounded-xl hover:bg-[#1a8cd8] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                    title="Copy link"
                  >
                    {copied ? '✓' : '📋'}
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
