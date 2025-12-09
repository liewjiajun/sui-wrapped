'use client';

import useSWR from 'swr';
import { useWrappedStore } from '@/stores/wrappedStore';
import type { WrappedData, WrappedApiResponse } from '@/types/wrapped';
import { LOADING_MESSAGES } from '@/types/wrapped';
import { API_ENDPOINTS } from '@/lib/constants';
import { useEffect, useRef } from 'react';

const fetcher = async (url: string): Promise<WrappedData> => {
  const response = await fetch(url);
  const json: WrappedApiResponse = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.error?.message || 'Failed to fetch wrapped data');
  }

  return json.data;
};

export function useWrappedData(address: string | null) {
  const { setIsLoading, setLoadingMessage, setWrappedData, setError } =
    useWrappedStore();

  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data, error, isLoading, mutate } = useSWR<WrappedData>(
    address ? API_ENDPOINTS.wrapped(address) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
      onSuccess: (data) => {
        setWrappedData(data);
        setIsLoading(false);
        setError(null);
      },
      onError: (err) => {
        setError(err.message);
        setIsLoading(false);
      },
    }
  );

  // Cycle through loading messages
  useEffect(() => {
    if (isLoading) {
      setIsLoading(true);
      let messageIndex = 0;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);

      loadingIntervalRef.current = setInterval(() => {
        messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
      }, 2000);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading, setIsLoading, setLoadingMessage]);

  return {
    data,
    error: error?.message || null,
    isLoading,
    refetch: mutate,
  };
}

// Hook for generating wrapped data (triggers indexer processing)
export function useGenerateWrapped() {
  const generateWrapped = async (address: string): Promise<WrappedData> => {
    const response = await fetch(API_ENDPOINTS.generate, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    const json: WrappedApiResponse = await response.json();

    if (!json.success || !json.data) {
      throw new Error(json.error?.message || 'Failed to generate wrapped data');
    }

    return json.data;
  };

  return { generateWrapped };
}
