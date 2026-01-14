import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { getEnvVar } from '../constants/env';
import { parseU64 } from '../utils/sui/data-access';
import { buildPlanetDataTx } from '../services/sui/transactions';
import { PlanetReserves, MineLevels, UpgradeCosts } from '../types';

interface UsePlanetProps {
  planetId: string;
  universeId: string;
}

interface UsePlanetReturn {
  reserves: PlanetReserves;
  mineLevels: MineLevels;
  upgradeCosts: UpgradeCosts;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePlanet({ planetId, universeId: _universeId }: UsePlanetProps): UsePlanetReturn {
  const account = useCurrentAccount();
  const client = useSuiClient();

  const [reserves, setReserves] = useState<PlanetReserves>({ erbium: 0, lanthanum: 0, thorium: 0 });
  const [mineLevels, setMineLevels] = useState<MineLevels>({ erbium: 0, lanthanum: 0, thorium: 0 });
  const [upgradeCosts, setUpgradeCosts] = useState<UpgradeCosts>({
    erbium: { erbium: 0, lanthanum: 0, thorium: 0 },
    lanthanum: { erbium: 0, lanthanum: 0, thorium: 0 },
    thorium: { erbium: 0, lanthanum: 0, thorium: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const packageId = getEnvVar('VITE_TRADE_WARS_PKG_DEV');

  // Fetch planet data using devInspect with SDK BCS parsing
  const fetchPlanetData = useCallback(async () => {
    if (!account?.address || !planetId || !packageId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = buildPlanetDataTx(packageId, planetId);

      const result = await client.devInspectTransactionBlock({
        sender: account.address,
        transactionBlock: tx,
      });

      if (!result.results || result.results.length < 15) {
        throw new Error('Incomplete planet data response');
      }

      // Parse reserves (indices 0-2) using SDK BCS
      const erbiumReserves = parseU64(result.results[0]?.returnValues?.[0]?.[0] || []);
      const lanthanumReserves = parseU64(result.results[1]?.returnValues?.[0]?.[0] || []);
      const thoriumReserves = parseU64(result.results[2]?.returnValues?.[0]?.[0] || []);

      // Parse mine levels (indices 3-5)
      const erbiumMineLevel = parseU64(result.results[3]?.returnValues?.[0]?.[0] || []);
      const lanthanumMineLevel = parseU64(result.results[4]?.returnValues?.[0]?.[0] || []);
      const thoriumMineLevel = parseU64(result.results[5]?.returnValues?.[0]?.[0] || []);

      // Parse upgrade costs (indices 6-14)
      const erbiumCosts = {
        erbium: parseU64(result.results[6]?.returnValues?.[0]?.[0] || []),
        lanthanum: parseU64(result.results[7]?.returnValues?.[0]?.[0] || []),
        thorium: parseU64(result.results[8]?.returnValues?.[0]?.[0] || []),
      };
      const lanthanumCosts = {
        erbium: parseU64(result.results[9]?.returnValues?.[0]?.[0] || []),
        lanthanum: parseU64(result.results[10]?.returnValues?.[0]?.[0] || []),
        thorium: parseU64(result.results[11]?.returnValues?.[0]?.[0] || []),
      };
      const thoriumCosts = {
        erbium: parseU64(result.results[12]?.returnValues?.[0]?.[0] || []),
        lanthanum: parseU64(result.results[13]?.returnValues?.[0]?.[0] || []),
        thorium: parseU64(result.results[14]?.returnValues?.[0]?.[0] || []),
      };

      setReserves({
        erbium: erbiumReserves,
        lanthanum: lanthanumReserves,
        thorium: thoriumReserves,
      });

      setMineLevels({
        erbium: erbiumMineLevel,
        lanthanum: lanthanumMineLevel,
        thorium: thoriumMineLevel,
      });

      setUpgradeCosts({
        erbium: erbiumCosts,
        lanthanum: lanthanumCosts,
        thorium: thoriumCosts,
      });

    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, planetId, packageId, client]);

  // Initial fetch
  useEffect(() => {
    fetchPlanetData();
  }, [fetchPlanetData]);

  return {
    reserves,
    mineLevels,
    upgradeCosts,
    isLoading,
    error,
    refetch: fetchPlanetData,
  };
}
