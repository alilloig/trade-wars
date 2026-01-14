import { useCurrentAccount } from '@mysten/dapp-kit';
import { useOverseer } from '../../hooks';
import { useNavigation } from '../../contexts';
import { Card, Button, Spinner, ErrorMessage } from '../ui';

export function OverseerList() {
  const account = useCurrentAccount();
  const { navigateToOverseer } = useNavigation();
  const { overseers, isLoading, error, isCreating, creationStatus, createOverseer } = useOverseer();

  if (!account) {
    return null;
  }

  if (error) {
    return (
      <div className="my-4">
        <h4 className="text-xl font-bold text-gold mb-2">Your Overseers</h4>
        <ErrorMessage message={`Error loading Overseers: ${error.message}`} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="my-4">
        <h4 className="text-xl font-bold text-gold mb-2">Your Overseers</h4>
        <div className="flex items-center gap-2 text-gray-400">
          <Spinner size="sm" />
          <span>Loading Overseers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <h4 className="text-xl font-bold text-gold mb-3">Your Overseers</h4>

      {overseers.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-gray-200">No Overseer found</p>
          {creationStatus && (
            <p className="text-sm text-gold">{creationStatus}</p>
          )}
          <Button
            onClick={createOverseer}
            disabled={isCreating}
          >
            {isCreating ? 'Creating Overseer...' : 'Create New Overseer'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {overseers.map((overseer, index) => (
            <Card
              key={overseer.objectId}
              variant="gold"
              onClick={() => navigateToOverseer(overseer.objectId)}
              className="cursor-pointer hover:bg-gold/20 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <p className="font-bold text-gold">Overseer #{index + 1}</p>
                <p className="text-sm text-gray-400 font-mono">ID: {overseer.objectId}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
