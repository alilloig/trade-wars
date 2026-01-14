import { PlanetDetailsView } from '../components/planet';
import { PlanetData } from '../types';

interface PlanetDetailsPageProps {
  planetId: string;
  overseerId: string;
  universeId: string;
  planetData: PlanetData;
}

export function PlanetDetailsPage({
  planetId,
  overseerId,
  universeId,
  planetData,
}: PlanetDetailsPageProps) {
  return (
    <PlanetDetailsView
      planetId={planetId}
      overseerId={overseerId}
      universeId={universeId}
      planetData={planetData}
    />
  );
}
