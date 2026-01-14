import { useUniverses } from '../../hooks';
import { useNavigation } from '../../contexts';
import { Card, Button, Spinner, ErrorMessage } from '../ui';
import { UniverseData } from '../../types';

interface OverseerEmpireProps {
  overseerId: string;
}

export function OverseerEmpire({ overseerId }: OverseerEmpireProps) {
  const { goBack, navigateToPlanets } = useNavigation();
  const {
    joinedUniverses,
    availableUniverses,
    isLoading,
    error,
    joiningUniverse,
    joinUniverse,
  } = useUniverses({ overseerId });

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
          <span>Loading overseer details...</span>
        </div>
        <Button variant="secondary" onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  const handleViewPlanets = (universe: UniverseData) => {
    navigateToPlanets(overseerId, universe.id, universe.name);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gold">Overseer Empire</h2>
        <Button variant="secondary" onClick={goBack}>Go Back</Button>
      </div>

      {/* Overseer Info */}
      <Card variant="gold">
        <div className="flex flex-col gap-2">
          <p className="font-bold text-gold">
            Overseer ID:{' '}
            <a
              href={`https://testnet.suivision.xyz/object/${overseerId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {overseerId}
            </a>
          </p>
          <p className="text-sm text-gray-400">
            Universes Joined: {joinedUniverses.length} | Open Universes Available: {availableUniverses.length}
          </p>
        </div>
      </Card>

      {/* Joined Universes */}
      <div>
        <h3 className="text-xl font-bold text-gold mb-3">
          Your Universes ({joinedUniverses.length})
        </h3>

        {joinedUniverses.length === 0 ? (
          <Card>
            <p className="text-gray-200">
              You haven't joined any universes yet. Choose from the available universes below.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {joinedUniverses.map((universe) => (
              <Card
                key={universe.id}
                variant="success"
                onClick={() => handleViewPlanets(universe)}
                className="cursor-pointer hover:bg-status-success/20 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-status-success">
                    {universe.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {universe.galaxies} galaxies - {universe.systems} systems - {universe.planets} planets
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{universe.id}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gold/30" />

      {/* Available Universes */}
      <div>
        <h3 className="text-xl font-bold text-gold mb-3">
          Available Universes ({availableUniverses.length})
        </h3>

        {availableUniverses.length === 0 ? (
          <Card>
            <p className="text-gray-200">
              No open universes available at the moment.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {availableUniverses.map((universe) => (
              <Card
                key={universe.id}
                variant="warning"
                onClick={() => joiningUniverse !== universe.id && joinUniverse(universe)}
                className={`transition-colors ${
                  joiningUniverse === universe.id
                    ? 'opacity-70 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-status-warning/20'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-status-warning">
                    {universe.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {universe.galaxies} galaxies - {universe.systems} systems - {universe.planets} planets
                  </p>
                  <p className="text-sm text-status-warning">
                    {joiningUniverse === universe.id ? 'Joining...' : 'Open for registration'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{universe.id}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
