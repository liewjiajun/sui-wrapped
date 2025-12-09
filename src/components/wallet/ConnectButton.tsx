'use client';

import {
  ConnectButton as DappKitConnectButton,
  useCurrentAccount,
  useDisconnectWallet,
} from '@mysten/dapp-kit';
import { useWrappedStore } from '@/stores/wrappedStore';
import { useEffect } from 'react';
import { truncateAddress } from '@/lib/utils';

interface ConnectButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function ConnectButton({
  className = '',
  variant = 'primary',
}: ConnectButtonProps) {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { setAddress, address } = useWrappedStore();

  // Sync wallet address to store
  useEffect(() => {
    if (currentAccount?.address) {
      setAddress(currentAccount.address);
    } else {
      setAddress(null);
    }
  }, [currentAccount?.address, setAddress]);

  const baseStyles =
    'px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl',
    secondary:
      'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20',
  };

  if (currentAccount) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <span className="text-sm text-white/80 font-mono">
            {truncateAddress(currentAccount.address)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <DappKitConnectButton
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    />
  );
}

// Simplified connect button for landing page
export function LandingConnectButton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <DappKitConnectButton className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg font-semibold rounded-2xl hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200" />
      <p className="text-white/50 text-sm">
        Or connect any Sui wallet to see your Wrapped
      </p>
    </div>
  );
}
