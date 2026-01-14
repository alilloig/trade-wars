import { useCurrentAccount } from '@mysten/dapp-kit';
import { Card } from '../ui';

export function WalletBanner() {
  const account = useCurrentAccount();

  if (account) {
    return null;
  }

  return (
    <Card variant="gold" className="text-center py-8">
      <h2 className="text-2xl font-bold text-gold mb-4">
        Welcome to Trade Wars
      </h2>
      <p className="text-gray-300 mb-4">
        Connect your wallet to start playing
      </p>
      <p className="text-sm text-gray-400">
        Build your empire, mine resources, and dominate the universe!
      </p>
    </Card>
  );
}
