import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit';
import { getEnvVar } from '../constants/env';
import { parseVectorOfIds } from '../utils/sui/data-access';
import { buildGetUniversePlanetsTx } from '../services/sui/transactions';
import { PlanetData } from '../types';

interface UsePlanetsProps {
  overseerId: string;
  universeId: string;
}

interface UsePlanetsReturn {
  planets: PlanetData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePlanets({ overseerId, universeId }: UsePlanetsProps): UsePlanetsReturn {
  const account = useCurrentAccount();
  const client = useSuiClient();

  const [planetIds, setPlanetIds] = useState<string[]>([]);
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const packageId = getEnvVar('VITE_TRADE_WARS_PKG_DEV');

  // Fetch planet IDs using devInspect
  const fetchPlanetIds = useCallback(async () => {
    if (!account?.address || !overseerId || !universeId || !packageId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = buildGetUniversePlanetsTx(packageId, overseerId, universeId);

      const result = await client.devInspectTransactionBlock({
        sender: account.address,
        transactionBlock: tx,
      });

      const returnValue = result.results?.[0]?.returnValues?.[0]?.[0];
      if (returnValue) {
        const ids = parseVectorOfIds(returnValue);
        setPlanetIds(ids);
      }
    } catch (err) {
      setError(err as Error);
    }
  }, [account?.address, overseerId, universeId, packageId, client]);

  // Fetch planet objects
  const { data: planetObjects, isLoading: planetsLoading, error: planetsError } = useSuiClientQuery(
    'multiGetObjects',
    {
      ids: planetIds,
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    },
    {
      enabled: planetIds.length > 0,
    },
  );

  // Initial fetch
  useEffect(() => {
    fetchPlanetIds();
  }, [fetchPlanetIds]);

  // Process planet objects
  useEffect(() => {
    if (planetObjects && planetObjects.length > 0) {
      const processed = planetObjects.map((obj) => {
        const content = obj.data?.content;
        let galaxy = 0, system = 0, position = 0;

        if (content && 'fields' in content) {
          const fields = content.fields as any;
          if (fields.info?.fields) {
            galaxy = Number(fields.info.fields.galaxy || 0);
            system = Number(fields.info.fields.system || 0);
            position = Number(fields.info.fields.position || 0);
          }
        }

        // Generate image index (1-6) based on planet position
        const imageIndex = ((galaxy + system + position) % 6) + 1;

        return {
          id: obj.data?.objectId || '',
          galaxy,
          system,
          position,
          imageIndex,
        };
      });

      // Sort by galaxy, system, position
      processed.sort((a, b) => {
        if (a.galaxy !== b.galaxy) return a.galaxy - b.galaxy;
        if (a.system !== b.system) return a.system - b.system;
        return a.position - b.position;
      });

      setPlanets(processed);
      setIsLoading(false);
    }
  }, [planetObjects]);

  // Handle errors
  useEffect(() => {
    if (planetsError) {
      setError(planetsError as Error);
      setIsLoading(false);
    }
  }, [planetsError]);

  return {
    planets,
    isLoading: isLoading || planetsLoading,
    error,
    refetch: fetchPlanetIds,
  };
}
