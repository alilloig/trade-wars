import { WalletBanner } from '../components/wallet';
import { OverseerList } from '../components/overseer';

export function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <WalletBanner />
      <OverseerList />
    </div>
  );
}
