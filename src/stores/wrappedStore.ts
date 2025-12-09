import { create } from 'zustand';
import type { WrappedData, ShareOptions, FluidParams, AudioParams } from '@/types/wrapped';

interface WrappedState {
  // Connection state
  address: string | null;
  isConnecting: boolean;

  // Data state
  wrappedData: WrappedData | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;

  // UI state
  currentCardIndex: number;
  isAudioEnabled: boolean;
  isShareModalOpen: boolean;
  shareOptions: ShareOptions;

  // Visual parameters
  fluidParams: FluidParams;
  audioParams: AudioParams;

  // Actions
  setAddress: (address: string | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setWrappedData: (data: WrappedData | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setLoadingMessage: (message: string) => void;
  setError: (error: string | null) => void;
  setCurrentCardIndex: (index: number) => void;
  nextCard: () => void;
  prevCard: () => void;
  setIsAudioEnabled: (enabled: boolean) => void;
  toggleAudio: () => void;
  setIsShareModalOpen: (isOpen: boolean) => void;
  setShareOptions: (options: Partial<ShareOptions>) => void;
  setFluidParams: (params: Partial<FluidParams>) => void;
  setAudioParams: (params: Partial<AudioParams>) => void;
  reset: () => void;
}

const TOTAL_CARDS = 7;

const initialShareOptions: ShareOptions = {
  showPersona: true,
  showGas: true,
  showTxCount: false,
  showProtocols: false,
};

const initialFluidParams: FluidParams = {
  turbulence: 50,
  viscosity: 50,
  hue: 200,
  saturation: 70,
  brightness: 60,
  particleDensity: 50,
};

const initialAudioParams: AudioParams = {
  bpm: 90,
  key: 'major',
  layers: {
    dex: false,
    lending: false,
    staking: false,
    nft: false,
  },
};

export const useWrappedStore = create<WrappedState>((set, get) => ({
  // Initial state
  address: null,
  isConnecting: false,
  wrappedData: null,
  isLoading: false,
  loadingMessage: '',
  error: null,
  currentCardIndex: 0,
  isAudioEnabled: false,
  isShareModalOpen: false,
  shareOptions: initialShareOptions,
  fluidParams: initialFluidParams,
  audioParams: initialAudioParams,

  // Actions
  setAddress: (address) => set({ address }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setWrappedData: (data) => set({ wrappedData: data }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setLoadingMessage: (message) => set({ loadingMessage: message }),
  setError: (error) => set({ error }),

  setCurrentCardIndex: (index) => {
    if (index >= 0 && index < TOTAL_CARDS) {
      set({ currentCardIndex: index });
    }
  },

  nextCard: () => {
    const { currentCardIndex } = get();
    if (currentCardIndex < TOTAL_CARDS - 1) {
      set({ currentCardIndex: currentCardIndex + 1 });
    }
  },

  prevCard: () => {
    const { currentCardIndex } = get();
    if (currentCardIndex > 0) {
      set({ currentCardIndex: currentCardIndex - 1 });
    }
  },

  setIsAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),

  toggleAudio: () => {
    const { isAudioEnabled } = get();
    set({ isAudioEnabled: !isAudioEnabled });
  },

  setIsShareModalOpen: (isOpen) => set({ isShareModalOpen: isOpen }),

  setShareOptions: (options) => {
    const { shareOptions } = get();
    set({ shareOptions: { ...shareOptions, ...options } });
  },

  setFluidParams: (params) => {
    const { fluidParams } = get();
    set({ fluidParams: { ...fluidParams, ...params } });
  },

  setAudioParams: (params) => {
    const { audioParams } = get();
    set({ audioParams: { ...audioParams, ...params } });
  },

  reset: () =>
    set({
      address: null,
      isConnecting: false,
      wrappedData: null,
      isLoading: false,
      loadingMessage: '',
      error: null,
      currentCardIndex: 0,
      isAudioEnabled: false,
      isShareModalOpen: false,
      shareOptions: initialShareOptions,
      fluidParams: initialFluidParams,
      audioParams: initialAudioParams,
    }),
}));
