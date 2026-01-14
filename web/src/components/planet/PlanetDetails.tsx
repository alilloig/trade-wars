import { usePlanet, useMineUpgrade } from '../../hooks';
import { useNavigation } from '../../contexts';
import { Card, Button, Badge, Spinner, ErrorMessage } from '../ui';
import { PlanetData, ElementType } from '../../types';
import { ELEMENT_COLORS } from '../../constants/colors';
import { formatNumber } from '../../utils/formatting/numbers';

interface PlanetDetailsViewProps {
  planetId: string;
  overseerId: string;
  universeId: string;
  planetData: PlanetData;
}

export function PlanetDetailsView({
  planetId,
  overseerId,
  universeId,
  planetData,
}: PlanetDetailsViewProps) {
  const { goBack } = useNavigation();

  const {
    reserves,
    mineLevels,
    upgradeCosts,
    elementSources,
    isLoading,
    error,
    refetch,
  } = usePlanet({ planetId, universeId });

  const {
    upgradeMine,
    canAfford,
    isUpgrading,
    status: upgradeStatus,
  } = useMineUpgrade({
    planetId,
    overseerId,
    universeId,
    elementSources,
    reserves,
    upgradeCosts,
    onSuccess: refetch,
  });

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
          <span>Loading planet details...</span>
        </div>
        <Button variant="secondary" onClick={goBack}>Go Back</Button>
      </div>
    );
  }

  const getPlanetImage = (imageIndex: number) => `/planet${imageIndex}.png`;

  const renderMineCard = (mineType: ElementType) => {
    const color = ELEMENT_COLORS[mineType];
    const level = mineLevels[mineType];
    const costs = upgradeCosts[mineType];
    const affordable = canAfford(mineType);
    const upgrading = isUpgrading === mineType;

    return (
      <Card
        key={mineType}
        className={`border-2`}
        style={{ borderColor: color, backgroundColor: `${color}10` }}
      >
        <div className="flex flex-col gap-3">
          {/* Mine Header */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-bold capitalize" style={{ color }}>
              {mineType} Mine
            </h4>
            <Badge style={{ backgroundColor: color, color: '#000' }}>
              Level {level}
            </Badge>
          </div>

          {/* Upgrade Costs */}
          <div className="text-sm">
            <p className="text-gray-400 mb-1">Upgrade Cost:</p>
            <div className="flex flex-wrap gap-2">
              <span style={{ color: ELEMENT_COLORS.erbium }}>
                {formatNumber(costs.erbium)} Erbium
              </span>
              <span style={{ color: ELEMENT_COLORS.lanthanum }}>
                {formatNumber(costs.lanthanum)} Lanthanum
              </span>
              <span style={{ color: ELEMENT_COLORS.thorium }}>
                {formatNumber(costs.thorium)} Thorium
              </span>
            </div>
          </div>

          {/* Upgrade Button */}
          <Button
            onClick={() => upgradeMine(mineType)}
            disabled={!affordable || !!isUpgrading}
            className="w-full"
            style={{
              backgroundColor: affordable && !isUpgrading ? color : '#4a4a4a',
              color: affordable && !isUpgrading ? '#000' : '#888',
            }}
          >
            {upgrading
              ? 'Upgrading...'
              : affordable
              ? `Upgrade to Level ${level + 1}`
              : 'Insufficient Resources'}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gold">Planet Details</h2>
        <Button variant="secondary" onClick={goBack}>Go Back</Button>
      </div>

      {/* Planet Header Card */}
      <Card variant="success">
        <div className="flex items-center gap-4">
          {/* Planet Image */}
          <img
            src={getPlanetImage(planetData.imageIndex)}
            alt={`Planet ${planetData.galaxy + 1}-${planetData.system + 1}-${planetData.position + 1}`}
            className="w-16 h-16 rounded-full border-2 border-status-success"
          />

          {/* Planet Info */}
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-status-success">
              Galaxy {planetData.galaxy + 1} - System {planetData.system + 1} - Position {planetData.position + 1}
            </h3>
            <a
              href={`https://testnet.suivision.xyz/object/${planetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 font-mono hover:underline"
            >
              {planetId}
            </a>
          </div>
        </div>
      </Card>

      {/* Upgrade Status */}
      {upgradeStatus && (
        <div className="p-3 bg-gold/10 border border-gold rounded-md">
          <p className="text-gold">{upgradeStatus}</p>
        </div>
      )}

      {/* Planet Reserves */}
      <div>
        <h3 className="text-xl font-bold text-gold mb-3">Planet Reserves</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            className="border-2"
            style={{ borderColor: ELEMENT_COLORS.erbium, backgroundColor: `${ELEMENT_COLORS.erbium}10` }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-400">Erbium</p>
              <p className="text-2xl font-bold" style={{ color: ELEMENT_COLORS.erbium }}>
                {formatNumber(reserves.erbium)}
              </p>
            </div>
          </Card>
          <Card
            className="border-2"
            style={{ borderColor: ELEMENT_COLORS.lanthanum, backgroundColor: `${ELEMENT_COLORS.lanthanum}10` }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-400">Lanthanum</p>
              <p className="text-2xl font-bold" style={{ color: ELEMENT_COLORS.lanthanum }}>
                {formatNumber(reserves.lanthanum)}
              </p>
            </div>
          </Card>
          <Card
            className="border-2"
            style={{ borderColor: ELEMENT_COLORS.thorium, backgroundColor: `${ELEMENT_COLORS.thorium}10` }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-400">Thorium</p>
              <p className="text-2xl font-bold" style={{ color: ELEMENT_COLORS.thorium }}>
                {formatNumber(reserves.thorium)}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Mine Upgrades */}
      <div>
        <h3 className="text-xl font-bold text-gold mb-3">Mine Upgrades</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderMineCard('erbium')}
          {renderMineCard('lanthanum')}
          {renderMineCard('thorium')}
        </div>
      </div>
    </div>
  );
}
