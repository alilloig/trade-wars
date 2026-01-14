import { ConnectButton } from '@mysten/dapp-kit';
import { useNavigation } from '../../contexts';

export function Header() {
  const { navigateHome } = useNavigation();

  return (
    <header className="sticky top-0 z-10 flex justify-between items-center px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-gold/30">
      <h1
        className="text-2xl font-bold text-gold cursor-pointer hover:text-gold-light transition-colors"
        onClick={navigateHome}
      >
        Trade Wars
      </h1>
      <ConnectButton />
    </header>
  );
}
