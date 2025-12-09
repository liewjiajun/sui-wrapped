'use client';

import { useMemo, useEffect } from 'react';
import { useWrappedStore } from '@/stores/wrappedStore';
import type { WrappedData, FluidParams, ProtocolCategory } from '@/types/wrapped';
import { CATEGORY_COLORS } from '@/lib/constants';
import { clamp, mapRange } from '@/lib/utils';

function getDominantCategory(
  categoryBreakdown: Record<ProtocolCategory, { percentage: number }>
): ProtocolCategory {
  let maxPercentage = 0;
  let dominant: ProtocolCategory = 'other';

  for (const [category, data] of Object.entries(categoryBreakdown) as [
    ProtocolCategory,
    { percentage: number }
  ][]) {
    if (data.percentage > maxPercentage) {
      maxPercentage = data.percentage;
      dominant = category;
    }
  }

  return dominant;
}

export function useFluidParams(data: WrappedData | null | undefined): FluidParams {
  const { setFluidParams } = useWrappedStore();

  const params = useMemo<FluidParams>(() => {
    if (!data) {
      return {
        turbulence: 50,
        viscosity: 50,
        hue: 200,
        saturation: 70,
        brightness: 60,
        particleDensity: 50,
      };
    }

    // Turbulence: Based on gas spend (higher spend = more turbulent)
    // Assuming median user spends ~$1 in gas, $10+ is high
    const turbulence = clamp(
      mapRange(data.gasSavings.totalSuiGasUsd, 0, 10, 20, 100),
      20,
      100
    );

    // Viscosity: Transaction velocity (tx per active day)
    // Average is ~5 tx/day, power users do 20+
    const velocity = data.totalTransactions / Math.max(data.activeDays, 1);
    const viscosity = clamp(mapRange(velocity, 0, 20, 30, 100), 30, 100);

    // Hue: Dominant protocol category
    const dominantCategory = getDominantCategory(data.categoryBreakdown);
    const hue = CATEGORY_COLORS[dominantCategory]?.hue ?? 180;

    // Saturation: Activity level
    // Based on total transactions, 100 is low, 1000+ is high
    const saturation = clamp(
      mapRange(data.totalTransactions, 0, 1000, 40, 100),
      40,
      100
    );

    // Brightness: Based on positive metrics
    // Uses percentile comparison - higher percentile = brighter
    const avgPercentile =
      (data.percentiles.transactions +
        data.percentiles.protocols +
        data.percentiles.activeDays) /
      3;
    const brightness = clamp(mapRange(avgPercentile, 0, 100, 40, 90), 40, 90);

    // Particle density: Protocol diversity
    // 1-2 protocols is low, 10+ is high
    const particleDensity = clamp(
      mapRange(data.uniqueProtocols.length, 1, 15, 20, 100),
      20,
      100
    );

    return {
      turbulence,
      viscosity,
      hue,
      saturation,
      brightness,
      particleDensity,
    };
  }, [data]);

  // Update store when params change
  useEffect(() => {
    setFluidParams(params);
  }, [params, setFluidParams]);

  return params;
}

// Hook for card-specific fluid variations
export function useCardFluidParams(
  baseParams: FluidParams,
  cardIndex: number
): FluidParams {
  return useMemo(() => {
    // Each card can have slightly different visual emphasis
    const cardModifiers: Record<number, Partial<FluidParams>> = {
      0: { turbulence: baseParams.turbulence * 0.5, brightness: 70 }, // Arrival - calm
      1: { particleDensity: 90 }, // Numbers - particle burst
      2: { hue: 120, saturation: 80 }, // Gas Savior - green/money
      3: { particleDensity: baseParams.particleDensity * 1.5 }, // Protocol Universe
      4: { turbulence: 70, hue: 200 }, // Trading - active/blue
      5: { hue: 30, turbulence: 60 }, // DeFi - orange/caution
      6: { hue: 60, viscosity: 80 }, // Staking - gold/stable
      7: { brightness: 85, saturation: 90 }, // Persona - vibrant finale
    };

    const modifier = cardModifiers[cardIndex] || {};

    return {
      ...baseParams,
      ...modifier,
      turbulence: clamp(modifier.turbulence ?? baseParams.turbulence, 0, 100),
      viscosity: clamp(modifier.viscosity ?? baseParams.viscosity, 0, 100),
      hue: modifier.hue ?? baseParams.hue,
      saturation: clamp(modifier.saturation ?? baseParams.saturation, 0, 100),
      brightness: clamp(modifier.brightness ?? baseParams.brightness, 0, 100),
      particleDensity: clamp(
        modifier.particleDensity ?? baseParams.particleDensity,
        0,
        100
      ),
    };
  }, [baseParams, cardIndex]);
}
