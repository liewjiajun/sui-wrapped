import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { PERSONA_COPY, Persona, WrappedData } from '@/types/wrapped';

export const runtime = 'edge';

// Fetch wrapped data from the API
async function getWrappedDataFromApi(address: string, baseUrl: string): Promise<WrappedData | null> {
  try {
    // Fetch from the wrapped API endpoint
    const response = await fetch(`${baseUrl}/api/wrapped/${address}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data as WrappedData;
      }
    }
  } catch (error) {
    console.error('Error fetching wrapped data for OG:', error);
  }

  return null;
}

// Persona gradient colors
const gradients: Record<string, { from: string; to: string }> = {
  move_maximalist: { from: '#a855f7', to: '#ec4899' },
  diamond_hand: { from: '#22d3ee', to: '#a855f7' },
  yield_architect: { from: '#4ade80', to: '#14b8a6' },
  jpeg_mogul: { from: '#ec4899', to: '#8b5cf6' },
  early_bird: { from: '#fbbf24', to: '#f97316' },
  balanced_builder: { from: '#60a5fa', to: '#14b8a6' },
};

// Category colors
const categoryColors: Record<string, string> = {
  dex: '#60a5fa',
  lending: '#4ade80',
  lst: '#fbbf24',
  nft: '#ec4899',
  bridge: '#f97316',
  other: '#94a3b8',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams, origin } = new URL(request.url);

    // Get screen type from query params
    const screen = searchParams.get('screen') || 'persona';

    const data = await getWrappedDataFromApi(address, origin);

    // Render appropriate screen
    switch (screen) {
      case 'overview':
        return renderOverviewScreen(data, address);
      case 'arrival':
        return renderArrivalScreen(data, address);
      case 'numbers':
        return renderNumbersScreen(data, address);
      case 'gas':
        return renderGasScreen(data, address);
      case 'protocols':
        return renderProtocolsScreen(data, address);
      case 'trading':
        return renderTradingScreen(data, address);
      case 'defi':
        return renderDefiScreen(data, address);
      case 'nft':
        return renderNFTScreen(data, address);
      case 'persona':
      default:
        return renderPersonaScreen(data, address);
    }
  } catch (error) {
    console.error('Error generating OG image:', error);
    return renderFallbackScreen();
  }
}

// Base wrapper for all screens
function BaseScreen({ children, address }: { children: React.ReactNode; address: string }) {
  return (
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
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4DA2FF, #06B6D4, #14B8A6)',
            marginRight: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M12 2C12 2 4 10 4 14.5C4 18.09 7.58 21 12 21C16.42 21 20 18.09 20 14.5C20 10 12 2 12 2ZM12 19C8.69 19 6 16.54 6 14.5C6 12.06 9.33 7.06 12 4.13C14.67 7.06 18 12.06 18 14.5C18 16.54 15.31 19 12 19Z" />
          </svg>
        </div>
        <span style={{ fontSize: '22px', fontWeight: 600 }}>Sui Wrapped 2025</span>
      </div>

      {children}

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
        <span style={{ fontSize: '14px' }}>suiwrapped-2025.vercel.app</span>
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
  );
}

// Overview Screen - shows summary of all stats
function renderOverviewScreen(data: WrappedData | null, address: string) {
  if (!data) {
    return renderFallbackScreen();
  }

  const personaCopy = PERSONA_COPY[data.persona];
  const gradient = gradients[data.persona] || gradients.balanced_builder;
  const txCount = data.totalTransactions.toLocaleString();
  const protocolCount = String(data.uniqueProtocols.length);
  const gasSaved = Math.round(data.gasSavings.savingsUsd).toLocaleString();
  const swapCount = String(data.tradingMetrics.swapCount);
  const nftCount = String(data.nftHoldings?.totalNFTs || 0);
  const activeDays = String(data.activeDays);
  const mainnetDay = String(data.daysAfterMainnetLaunch);
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

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
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4DA2FF, #06B6D4, #14B8A6)',
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 2C12 2 4 10 4 14.5C4 18.09 7.58 21 12 21C16.42 21 20 18.09 20 14.5C20 10 12 2 12 2ZM12 19C8.69 19 6 16.54 6 14.5C6 12.06 9.33 7.06 12 4.13C14.67 7.06 18 12.06 18 14.5C18 16.54 15.31 19 12 19Z" />
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: '22px', fontWeight: 600 }}>Sui Wrapped 2025</div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Persona header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px' }}>
            <div style={{ display: 'flex', fontSize: '48px', marginRight: '16px' }}>{personaCopy.emoji}</div>
            <div style={{ display: 'flex', fontSize: '48px', fontWeight: 700, color: gradient.from }}>
              {personaCopy.title}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', marginBottom: '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 40px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', marginRight: '28px' }}>
              <div style={{ display: 'flex', fontSize: '56px', fontWeight: 700 }}>{txCount}</div>
              <div style={{ display: 'flex', fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>Transactions</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 40px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', marginRight: '28px' }}>
              <div style={{ display: 'flex', fontSize: '56px', fontWeight: 700 }}>{protocolCount}</div>
              <div style={{ display: 'flex', fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>Protocols</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 40px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px' }}>
              <div style={{ display: 'flex', fontSize: '56px', fontWeight: 700 }}>{activeDays}</div>
              <div style={{ display: 'flex', fontSize: '18px', color: 'rgba(255,255,255,0.6)' }}>Active Days</div>
            </div>
          </div>

          {/* Secondary stats */}
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', background: 'rgba(74, 222, 128, 0.15)', borderRadius: '14px', marginRight: '20px' }}>
              <div style={{ display: 'flex', color: '#4ade80', fontWeight: 600, fontSize: '20px', marginRight: '10px' }}>${gasSaved}</div>
              <div style={{ display: 'flex', fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>Gas Saved</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', background: 'rgba(96, 165, 250, 0.15)', borderRadius: '14px', marginRight: '20px' }}>
              <div style={{ display: 'flex', color: '#60a5fa', fontWeight: 600, fontSize: '20px', marginRight: '10px' }}>{swapCount}</div>
              <div style={{ display: 'flex', fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>Swaps</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', background: 'rgba(236, 72, 153, 0.15)', borderRadius: '14px' }}>
              <div style={{ display: 'flex', color: '#ec4899', fontWeight: 600, fontSize: '20px', marginRight: '10px' }}>{nftCount}</div>
              <div style={{ display: 'flex', fontSize: '16px', color: 'rgba(255,255,255,0.6)' }}>NFTs</div>
            </div>
          </div>

          {/* Mainnet day */}
          <div style={{ display: 'flex', marginTop: '32px', fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>
            First transaction: {mainnetDay} days after Sui Mainnet
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '24px', left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>suiwrapped-2025.vercel.app</div>
        </div>

        {/* Address */}
        <div style={{ position: 'absolute', bottom: '24px', right: '24px', display: 'flex', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
          {shortAddress}
        </div>
      </div>
    ),
    { width: 1200, height: 600 }
  );
}

// Persona Screen
function renderPersonaScreen(data: WrappedData | null, address: string) {
  if (!data) {
    return renderFallbackScreen();
  }

  const personaCopy = PERSONA_COPY[data.persona];
  const gradient = gradients[data.persona] || gradients.balanced_builder;

  return new ImageResponse(
    (
      <BaseScreen address={address}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '20px', opacity: 0.7, marginBottom: '8px' }}>
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
          <span style={{ fontSize: '48px', marginTop: '16px' }}>
            {personaCopy.emoji}
          </span>
          <span
            style={{
              fontSize: '16px',
              opacity: 0.7,
              marginTop: '24px',
              maxWidth: '500px',
              textAlign: 'center',
            }}
          >
            {personaCopy.description}
          </span>
        </div>
      </BaseScreen>
    ),
    { width: 1200, height: 630 }
  );
}

// Arrival Screen
function renderArrivalScreen(data: WrappedData | null, address: string) {
  if (!data) {
    return renderFallbackScreen();
  }

  const date = new Date(data.firstTransactionTimestamp);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return new ImageResponse(
    (
      <BaseScreen address={address}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '20px', opacity: 0.7, marginBottom: '16px' }}>
            You first transacted on Sui on
          </span>
          <span style={{ fontSize: '48px', fontWeight: 700 }}>{formattedDate}</span>
          <span style={{ fontSize: '20px', opacity: 0.7, marginTop: '24px' }}>
            Day <span style={{ fontWeight: 700, color: '#4FC3F7' }}>{data.daysAfterMainnetLaunch}</span> of Mainnet
          </span>
        </div>
      </BaseScreen>
    ),
    { width: 1200, height: 630 }
  );
}

// Numbers Screen
function renderNumbersScreen(data: WrappedData | null, address: string) {
  if (!data) {
    return renderFallbackScreen();
  }

  return new ImageResponse(
    (
      <BaseScreen address={address}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '24px', opacity: 0.7, marginBottom: '32px' }}>
            Your 2025 Numbers
          </span>
          <div style={{ display: 'flex', gap: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '56px', fontWeight: 700 }}>
                {data.totalTransactions.toLocaleString()}
              </span>
              <span style={{ fontSize: '16px', opacity: 0.7 }}>Transactions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '56px', fontWeight: 700 }}>
                {data.uniqueProtocols.length}
              </span>
              <span style={{ fontSize: '16px', opacity: 0.7 }}>Protocols</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '56px', fontWeight: 700 }}>{data.activeDays}</span>
              <span style={{ fontSize: '16px', opacity: 0.7 }}>Active Days</span>
            </div>
          </div>
        </div>
      </BaseScreen>
    ),
    { width: 1200, height: 630 }
  );
}

// Gas Savings Screen
function renderGasScreen(data: WrappedData | null, address: string) {
  if (!data) {
    return renderFallbackScreen();
  }

  return new ImageResponse(
    (
      <BaseScreen address={address}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '24px', opacity: 0.7, marginBottom: '16px' }}>
            Gas Savings vs Ethereum
          </span>
          <span style={{ fontSize: '72px', fontWeight: 700, color: '#4ade80' }}>
            ${Math.round(data.gasSavings.savingsUsd).toLocaleString()}
          </span>
          <span style={{ fontSize: '20px', opacity: 0.7, marginTop: '16px' }}>
            {Math.round(data.gasSavings.savingsMultiple)}x cheaper on Sui
          </span>
        </div>
      </BaseScreen>
    ),
    { width: 1200, height: 630 }
  );
}

// Protocols Screen
function renderProtocolsScreen(data: WrappedData | null, address: string) {
  if (!data) {
    return renderFallbackScreen();
  }

  const topProtocols = data.protocolBreakdown.slice(0, 5);

  return new ImageResponse(
    (
      <BaseScreen address={address}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '24px', opacity: 0.7, marginBottom: '24px' }}>
            Protocol Universe
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            {topProtocols.map((protocol, index) => (
              <div
                key={protocol.protocol}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 24px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  minWidth: '300px',
                }}
              >
                <span style={{ fontSize: '20px', fontWeight: 600 }}>
                  {index + 1}.
                </span>
                <span style={{ fontSize: '20px', flex: 1 }}>{protocol.displayName}</span>
                <span style={{ fontSize: '16px', opacity: 0.7 }}>
                  {protocol.transactionCount} txns
                </span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: '16px', opacity: 0.5, marginTop: '24px' }}>
            {data.uniqueProtocols.length} protocols used in 2025
          </span>
        </div>
      </BaseScreen>
    ),
    { width: 1200, height: 630 }
  );
}

// Trading Screen
function renderTradingScreen(data: WrappedData | null, address: string) {
  if (!data) {
    return renderFallbackScreen();
  }

  const dexProtocols = data.protocolBreakdown.filter((p) => p.category === 'dex');

  return new ImageResponse(
    (
      <BaseScreen address={address}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '24px', opacity: 0.7, marginBottom: '16px' }}>
            Trading Activity
          </span>
          <span style={{ fontSize: '64px', fontWeight: 700, color: '#60a5fa' }}>
            {data.tradingMetrics.swapCount}
          </span>
          <span style={{ fontSize: '20px', opacity: 0.7 }}>Swaps in 2025</span>
          {dexProtocols.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              {dexProtocols.slice(0, 3).map((protocol) => (
                <div
                  key={protocol.protocol}
                  style={{
                    padding: '12px 20px',
                    background: 'rgba(96, 165, 250, 0.2)',
                    borderRadius: '12px',
                    fontSize: '16px',
                  }}
                >
                  {protocol.displayName}
                </div>
              ))}
            </div>
          )}
        </div>
      </BaseScreen>
    ),
    { width: 1200, height: 630 }
  );
}

// DeFi Screen
function renderDefiScreen(data: WrappedData | null, address: string) {
  if (!data) {
    return renderFallbackScreen();
  }

  const lendingProtocols = data.protocolBreakdown.filter((p) => p.category === 'lending');
  const lstProtocols = data.protocolBreakdown.filter((p) => p.category === 'lst');

  return new ImageResponse(
    (
      <BaseScreen address={address}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '24px', opacity: 0.7, marginBottom: '24px' }}>
            DeFi Activity
          </span>
          <div style={{ display: 'flex', gap: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '48px', fontWeight: 700, color: '#4ade80' }}>
                {lendingProtocols.length}
              </span>
              <span style={{ fontSize: '16px', opacity: 0.7 }}>Lending Protocols</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '48px', fontWeight: 700, color: '#fbbf24' }}>
                {lstProtocols.length}
              </span>
              <span style={{ fontSize: '16px', opacity: 0.7 }}>LST Protocols</span>
            </div>
          </div>
          {(lendingProtocols.length > 0 || lstProtocols.length > 0) && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[...lendingProtocols, ...lstProtocols].slice(0, 4).map((protocol) => (
                <div
                  key={protocol.protocol}
                  style={{
                    padding: '10px 16px',
                    background: protocol.category === 'lending' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                    borderRadius: '12px',
                    fontSize: '14px',
                  }}
                >
                  {protocol.displayName}
                </div>
              ))}
            </div>
          )}
        </div>
      </BaseScreen>
    ),
    { width: 1200, height: 630 }
  );
}

// NFT Screen
function renderNFTScreen(data: WrappedData | null, address: string) {
  if (!data) {
    return renderFallbackScreen();
  }

  const topCollections = data.nftHoldings?.holdings?.slice(0, 4) || [];

  return new ImageResponse(
    (
      <BaseScreen address={address}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '24px', opacity: 0.7, marginBottom: '16px' }}>
            NFT Collection
          </span>
          <span style={{ fontSize: '64px', fontWeight: 700, color: '#ec4899' }}>
            {data.nftHoldings?.totalNFTs || 0}
          </span>
          <span style={{ fontSize: '20px', opacity: 0.7 }}>Total NFTs</span>
          {topCollections.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '32px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {topCollections.map((collection) => (
                <div
                  key={collection.collection}
                  style={{
                    padding: '10px 16px',
                    background: 'rgba(236, 72, 153, 0.2)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>{collection.displayName}</span>
                  <span style={{ opacity: 0.7 }}>({collection.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </BaseScreen>
    ),
    { width: 1200, height: 630 }
  );
}

// Fallback Screen
function renderFallbackScreen() {
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
          suiwrapped-2025.vercel.app
        </span>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
