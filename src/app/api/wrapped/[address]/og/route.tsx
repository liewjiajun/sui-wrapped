import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { PERSONA_COPY, Persona } from '@/types/wrapped';

export const runtime = 'edge';

// Fetch wrapped data (simplified for OG generation)
async function getWrappedData(address: string) {
  // In production, fetch from your API or database
  // For now, generate deterministic mock data based on address
  const seed = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed + min + max) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const personas: Persona[] = [
    Persona.MOVE_MAXIMALIST,
    Persona.DIAMOND_HAND,
    Persona.YIELD_ARCHITECT,
    Persona.JPEG_MOGUL,
    Persona.EARLY_BIRD,
    Persona.BALANCED_BUILDER,
  ];

  return {
    address,
    persona: personas[seed % personas.length] as Persona,
    totalTransactions: random(50, 2000),
    gasSavedUsd: random(100, 10000),
    uniqueProtocols: random(3, 15),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);

    const showPersona = searchParams.get('persona') !== 'false';
    const showGas = searchParams.get('gas') === 'true';
    const showTx = searchParams.get('tx') === 'true';

    const data = await getWrappedData(address);
    const personaCopy = PERSONA_COPY[data.persona];

    // Persona gradient colors
    const gradients: Record<string, { from: string; to: string }> = {
      move_maximalist: { from: '#a855f7', to: '#ec4899' },
      diamond_hand: { from: '#22d3ee', to: '#a855f7' },
      yield_architect: { from: '#4ade80', to: '#14b8a6' },
      jpeg_mogul: { from: '#ec4899', to: '#8b5cf6' },
      early_bird: { from: '#fbbf24', to: '#f97316' },
      balanced_builder: { from: '#60a5fa', to: '#14b8a6' },
    };

    const gradient = gradients[data.persona] || gradients.balanced_builder;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d1b2a 100%)',
            fontFamily: 'system-ui, sans-serif',
            color: 'white',
            padding: '48px',
          }}
        >
          {/* Background pattern overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
            }}
          />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '32px',
            }}
          >
            {/* Sui logo placeholder */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4FC3F7, #0288D1)',
                marginRight: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              S
            </div>
            <span style={{ fontSize: '28px', fontWeight: 600 }}>
              Sui Wrapped 2025
            </span>
          </div>

          {/* Persona section */}
          {showPersona && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <span
                style={{
                  fontSize: '20px',
                  opacity: 0.7,
                  marginBottom: '8px',
                }}
              >
                I am
              </span>
              <span
                style={{
                  fontSize: '56px',
                  fontWeight: 800,
                  background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})`,
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {personaCopy.title}
              </span>
              <span style={{ fontSize: '48px', marginTop: '8px' }}>
                {personaCopy.emoji}
              </span>
            </div>
          )}

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
            }}
          >
            {showTx && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '48px', fontWeight: 700 }}>
                  {data.totalTransactions.toLocaleString()}
                </span>
                <span style={{ fontSize: '16px', opacity: 0.7 }}>
                  Transactions
                </span>
              </div>
            )}

            {showGas && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '48px', fontWeight: 700, color: '#4ade80' }}>
                  ${data.gasSavedUsd.toLocaleString()}
                </span>
                <span style={{ fontSize: '16px', opacity: 0.7 }}>
                  Gas Saved vs ETH
                </span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '48px', fontWeight: 700 }}>
                {data.uniqueProtocols}
              </span>
              <span style={{ fontSize: '16px', opacity: 0.7 }}>Protocols</span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.5,
            }}
          >
            <span style={{ fontSize: '14px' }}>wrapped.sui.io</span>
          </div>

          {/* Address */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              fontSize: '12px',
              opacity: 0.5,
              fontFamily: 'monospace',
            }}
          >
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);

    // Return a fallback image
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <span style={{ fontSize: '48px', fontWeight: 700 }}>Sui Wrapped 2025</span>
          <span style={{ fontSize: '24px', opacity: 0.7, marginTop: '16px' }}>
            wrapped.sui.io
          </span>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
