import type { Metadata } from 'next';

interface Props {
  params: Promise<{ address: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const baseUrl = 'https://suiwrapped-2025.vercel.app';
  const ogImageUrl = `${baseUrl}/api/wrapped/${address}/og?screen=overview`;

  return {
    title: `Sui Wrapped 2025 | ${address.slice(0, 6)}...${address.slice(-4)}`,
    description: 'Check out my personalized Sui blockchain journey for 2025!',
    openGraph: {
      title: 'Sui Wrapped 2025',
      description: 'Check out my personalized Sui blockchain journey for 2025!',
      url: `${baseUrl}/${address}`,
      siteName: 'Sui Wrapped',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 600,
          alt: 'Sui Wrapped 2025',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sui Wrapped 2025',
      description: 'Check out my personalized Sui blockchain journey for 2025!',
      images: [ogImageUrl],
    },
  };
}

export default function AddressLayout({ children }: Props) {
  return children;
}
