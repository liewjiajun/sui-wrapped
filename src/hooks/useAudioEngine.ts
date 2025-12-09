'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useWrappedStore } from '@/stores/wrappedStore';
import type { WrappedData, AudioParams } from '@/types/wrapped';

// For now, disable audio generation entirely
// TODO: Add copyright-free music file

export function useAudioEngine(data: WrappedData | null | undefined) {
  const { isAudioEnabled, setAudioParams } = useWrappedStore();
  const isInitializedRef = useRef(false);

  const audioParams = useMemo<AudioParams>(() => {
    return {
      bpm: 120,
      key: 'major',
      layers: { dex: false, lending: false, staking: false, nft: false },
    };
  }, []);

  // Update store when params change
  useEffect(() => {
    setAudioParams(audioParams);
  }, [audioParams, setAudioParams]);

  // Initialize and start audio
  const startAudio = useCallback(async () => {
    // Audio disabled for now
    isInitializedRef.current = false;
  }, []);

  // Stop audio
  const stopAudio = useCallback(async () => {
    isInitializedRef.current = false;
  }, []);

  // Handle audio enable/disable
  useEffect(() => {
    if (isAudioEnabled && data) {
      startAudio();
    } else {
      stopAudio();
    }

    return () => {
      stopAudio();
    };
  }, [isAudioEnabled, data, startAudio, stopAudio]);

  return {
    audioParams,
    isPlaying: false,
    startAudio,
    stopAudio,
  };
}
