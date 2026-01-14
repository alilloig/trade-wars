import { usePlanets } from '../../hooks';
import { useNavigation } from '../../contexts';
import { Card, Button, Spinner, ErrorMessage } from '../ui';
import { PlanetData } from '../../types';

interface PlanetGridProps {
  overseerId: string;
  universeId: string;
  universeName: string;
}

export function PlanetGrid({ overseerId, universeId, universeName }: PlanetGridProps) {
  const { goBack, navigateToPlanetDetails } = useNavigation();
  const { planets, isLoading, error } = usePlanets({ overseerId, universeId });

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorMessage message={error.message} />
        <Button variant="secondary" onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Spinner size="sm" />
          <span>Loading planets...</span>
        </div>
        <Button variant="secondary" onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  const handleSelectPlanet = (planet: PlanetData) => {
    navigateToPlanetDetails(planet.id, overseerId, universeId, planet);
  };

  const getPlanetImage = (imageIndex: number) => `/planet${imageIndex}.png`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gold">{universeName}</h2>
        <Button variant="secondary" onClick={goBack}>Go Back</Button>
      </div>

      {/* Planet Count */}
      <p className="text-gray-400">
        Your planets in this universe: {planets.length}
      </p>

      {/* Planet Grid */}
      {planets.length === 0 ? (
        <Card>
          <p className="text-gray-200">No planets found in this universe.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {planets.map((planet) => (
            <Card
              key={planet.id}
              variant="success"
              onClick={() => handleSelectPlanet(planet)}
              className="cursor-pointer hover:bg-status-success/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Planet Image */}
                <img
                  src={getPlanetImage(planet.imageIndex)}
                  alt={`Planet ${planet.galaxy + 1}-${planet.system + 1}-${planet.position + 1}`}
                  className="w-12 h-12 rounded-full border-2 border-status-success"
                />

                {/* Planet Info */}
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-status-success">
                    Galaxy {planet.galaxy + 1} - System {planet.system + 1} - Pos {planet.position + 1}
                  </p>
                  <p className="text-xs text-gray-500 font-mono truncate max-w-[150px]">
                    {planet.id}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
