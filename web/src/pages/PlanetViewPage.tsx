import { PlanetGrid } from '../components/planet';

interface PlanetViewPageProps {
  overseerId: string;
  universeId: string;
  universeName: string;
}

export function PlanetViewPage({ overseerId, universeId, universeName }: PlanetViewPageProps) {
  return (
    <PlanetGrid
      overseerId={overseerId}
      universeId={universeId}
      universeName={universeName}
    />
  );
}
