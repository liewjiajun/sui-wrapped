import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@mysten/dapp-kit/dist/index.css';
import { SuiWalletProvider } from '@/components/wallet/WalletProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wrapped.sui.io'),
  title: 'Sui Wrapped 2025 | Your Year on Sui',
  description:
    'Discover your personalized Sui blockchain journey. See your transactions, gas savings, favorite protocols, and unique persona.',
  keywords: ['Sui', 'Wrapped', 'Blockchain', 'DeFi', 'Analytics', 'Move'],
  authors: [{ name: 'Sui Wrapped Team' }],
  openGraph: {
    title: 'Sui Wrapped 2025',
    description: 'Discover your personalized Sui blockchain journey',
    url: 'https://wrapped.sui.io',
    siteName: 'Sui Wrapped',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Sui Wrapped 2025',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sui Wrapped 2025',
    description: 'Discover your personalized Sui blockchain journey',
    images: ['/og-default.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f0f23',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SuiWalletProvider>{children}</SuiWalletProvider>
      </body>
    </html>
  );
}
