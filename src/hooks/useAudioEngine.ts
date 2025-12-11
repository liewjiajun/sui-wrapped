'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useWrappedStore } from '@/stores/wrappedStore';
import type { WrappedData, AudioParams } from '@/types/wrapped';

// 8-bit style victory music using Web Audio API
// Musical scale frequencies (C major pentatonic for upbeat feel)
const NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
  C6: 1046.50,
};

// Victory melody pattern (upbeat 8-bit style)
const MELODY_PATTERNS = {
  main: [
    { note: 'E5', duration: 0.15 },
    { note: 'G5', duration: 0.15 },
    { note: 'C6', duration: 0.3 },
    { note: 'A5', duration: 0.15 },
    { note: 'G5', duration: 0.15 },
    { note: 'E5', duration: 0.3 },
    { note: 'D5', duration: 0.15 },
    { note: 'E5', duration: 0.15 },
    { note: 'G5', duration: 0.3 },
    { note: 'E5', duration: 0.15 },
    { note: 'D5', duration: 0.15 },
    { note: 'C5', duration: 0.3 },
  ],
  fanfare: [
    { note: 'C5', duration: 0.1 },
    { note: 'E5', duration: 0.1 },
    { note: 'G5', duration: 0.1 },
    { note: 'C6', duration: 0.4 },
    { note: 'G5', duration: 0.15 },
    { note: 'C6', duration: 0.5 },
  ],
  arpeggio: [
    { note: 'C4', duration: 0.1 },
    { note: 'E4', duration: 0.1 },
    { note: 'G4', duration: 0.1 },
    { note: 'C5', duration: 0.1 },
    { note: 'E5', duration: 0.1 },
    { note: 'G5', duration: 0.1 },
    { note: 'C6', duration: 0.2 },
  ],
};

// Bass line pattern
const BASS_PATTERN = [
  { note: 'C4', duration: 0.25 },
  { note: 'G4', duration: 0.25 },
  { note: 'C4', duration: 0.25 },
  { note: 'G4', duration: 0.25 },
  { note: 'A4', duration: 0.25 },
  { note: 'E4', duration: 0.25 },
  { note: 'A4', duration: 0.25 },
  { note: 'E4', duration: 0.25 },
];

// Drum pattern (using noise and short tones)
const DRUM_PATTERN = [
  { type: 'kick', time: 0 },
  { type: 'hihat', time: 0.125 },
  { type: 'snare', time: 0.25 },
  { type: 'hihat', time: 0.375 },
  { type: 'kick', time: 0.5 },
  { type: 'hihat', time: 0.625 },
  { type: 'snare', time: 0.75 },
  { type: 'hihat', time: 0.875 },
];

export function useAudioEngine(data: WrappedData | null | undefined) {
  const { isAudioEnabled, setAudioParams } = useWrappedStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const scheduledNodesRef = useRef<(OscillatorNode | AudioBufferSourceNode)[]>([]);

  const audioParams = useMemo<AudioParams>(() => {
    if (!data) {
      return {
        bpm: 140,
        key: 'major',
        layers: { dex: false, lending: false, staking: false, nft: false },
      };
    }

    // Determine layers based on user activity
    const dexActive = data.tradingMetrics.swapCount > 0;
    const lendingActive = data.lendingMetrics.protocolsUsed.length > 0;
    const stakingActive = data.stakingMetrics.totalStakedSui > 0;
    const nftActive = (data.nftHoldings?.totalNFTs || 0) > 0;

    return {
      bpm: 140, // Upbeat tempo
      key: 'major',
      layers: {
        dex: dexActive,
        lending: lendingActive,
        staking: stakingActive,
        nft: nftActive,
      },
    };
  }, [data]);

  useEffect(() => {
    setAudioParams(audioParams);
  }, [audioParams, setAudioParams]);

  // Create 8-bit square wave oscillator
  const createSquareOsc = useCallback((ctx: AudioContext, freq: number, gain: number) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = freq;
    gainNode.gain.value = gain;

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    return { osc, gainNode };
  }, []);

  // Create noise for drums
  const createNoiseBuffer = useCallback((ctx: AudioContext, duration: number) => {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }, []);

  // Play a note with 8-bit envelope
  const playNote = useCallback((ctx: AudioContext, noteKey: string, startTime: number, duration: number, volume: number = 0.15) => {
    const freq = NOTES[noteKey as keyof typeof NOTES];
    if (!freq) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'square';
    osc.frequency.value = freq;

    // 8-bit style envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.setValueAtTime(volume * 0.7, startTime + duration * 0.1);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    scheduledNodesRef.current.push(osc);
  }, []);

  // Play bass note
  const playBass = useCallback((ctx: AudioContext, noteKey: string, startTime: number, duration: number) => {
    const freq = NOTES[noteKey as keyof typeof NOTES];
    if (!freq) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Triangle wave for deeper bass
    osc.type = 'triangle';
    osc.frequency.value = freq / 2; // One octave lower

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0.15, startTime + duration * 0.5);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    scheduledNodesRef.current.push(osc);
  }, []);

  // Play drum hit
  const playDrum = useCallback((ctx: AudioContext, type: string, startTime: number) => {
    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, startTime);
      osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.1);

      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);

      scheduledNodesRef.current.push(osc);
    } else if (type === 'snare') {
      // Noise burst for snare
      const noiseBuffer = createNoiseBuffer(ctx, 0.1);
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      noise.buffer = noiseBuffer;
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      noiseGain.gain.setValueAtTime(0.15, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(startTime);
      noise.stop(startTime + 0.1);

      scheduledNodesRef.current.push(noise);
    } else if (type === 'hihat') {
      // Short noise for hihat
      const noiseBuffer = createNoiseBuffer(ctx, 0.05);
      const noise = ctx.createBufferSource();
      const noiseGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      noise.buffer = noiseBuffer;
      filter.type = 'highpass';
      filter.frequency.value = 8000;

      noiseGain.gain.setValueAtTime(0.08, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(startTime);
      noise.stop(startTime + 0.05);

      scheduledNodesRef.current.push(noise);
    }
  }, [createNoiseBuffer]);

  // Schedule a full loop
  const scheduleLoop = useCallback((ctx: AudioContext, startTime: number) => {
    const beatDuration = 60 / audioParams.bpm;
    const barDuration = beatDuration * 4;

    // Bass layer - main rhythm foundation
    let bassTime = startTime;
    for (const { note, duration } of BASS_PATTERN) {
      playBass(ctx, note, bassTime, duration * beatDuration);
      bassTime += duration * beatDuration;
    }

    // Drums layer
    for (let bar = 0; bar < 2; bar++) {
      for (const drum of DRUM_PATTERN) {
        playDrum(ctx, drum.type, startTime + (bar * barDuration) + (drum.time * barDuration));
      }
    }

    return barDuration * 2; // Return loop duration
  }, [audioParams, playBass, playDrum]);

  // Main audio loop
  const startAudio = useCallback(async () => {
    if (isPlayingRef.current) return;

    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = ctx;
      isPlayingRef.current = true;

      // Start main loop immediately (no fanfare)
      let nextLoopTime = ctx.currentTime + 0.1;

      const scheduleAhead = () => {
        if (!isPlayingRef.current || !audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const lookAhead = 0.5; // Schedule 0.5 seconds ahead

        while (nextLoopTime < ctx.currentTime + lookAhead) {
          const loopDuration = scheduleLoop(ctx, nextLoopTime);
          nextLoopTime += loopDuration;
        }

        animationFrameRef.current = requestAnimationFrame(scheduleAhead);
      };

      scheduleAhead();
    } catch (error) {
      console.error('Error starting audio:', error);
      isPlayingRef.current = false;
    }
  }, [scheduleLoop]);

  const stopAudio = useCallback(() => {
    isPlayingRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Stop all scheduled nodes
    for (const node of scheduledNodesRef.current) {
      try {
        node.stop();
        node.disconnect();
      } catch {
        // Node may have already stopped
      }
    }
    scheduledNodesRef.current = [];

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

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
    isPlaying: isPlayingRef.current,
    startAudio,
    stopAudio,
  };
}
