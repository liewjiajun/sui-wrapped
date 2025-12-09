import { NextRequest, NextResponse } from 'next/server';
import type { WrappedApiResponse } from '@/types/wrapped';
import { isValidSuiAddress } from '@/lib/utils';
import { ERROR_CODES } from '@/lib/constants';
import { getWrappedData } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    // Validate address
    if (!isValidSuiAddress(address)) {
      const response: WrappedApiResponse = {
        success: false,
        error: {
          code: ERROR_CODES.INVALID_ADDRESS,
          message: 'Invalid Sui address format',
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Fetch real blockchain data
    const wrappedData = await getWrappedData(address);

    const response: WrappedApiResponse = {
      success: true,
      data: wrappedData,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching wrapped data:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate wrapped data';
    const isNoTransactions = errorMessage.includes('No transactions found');

    const response: WrappedApiResponse = {
      success: false,
      error: {
        code: isNoTransactions ? ERROR_CODES.NO_TRANSACTIONS : ERROR_CODES.GENERATION_FAILED,
        message: errorMessage,
      },
    };

    return NextResponse.json(response, { status: isNoTransactions ? 404 : 500 });
  }
}
