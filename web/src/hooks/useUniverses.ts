import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getEnvVar, getGlobalElementSources } from '../constants/env';
import { buildJoinUniverseTx } from '../services/sui/transactions';
import { UniverseData } from '../types';

interface UseUniversesProps {
  overseerId: string;
}

interface UseUniversesReturn {
  joinedUniverses: UniverseData[];
  availableUniverses: UniverseData[];
  isLoading: boolean;
  error: Error | null;
  joiningUniverse: string | null;
  joinUniverse: (universe: UniverseData) => void;
  refetch: () => Promise<void>;
}

export function useUniverses({ overseerId }: UseUniversesProps): UseUniversesReturn {
  const account = useCurrentAccount();
  const [joinedUniverseIds, setJoinedUniverseIds] = useState<string[]>([]);
  const [joiningUniverse, setJoiningUniverse] = useState<string | null>(null);

  const packageId = getEnvVar('VITE_TRADE_WARS_PKG_DEV');
  const tradeWarsInfoId = getEnvVar('VITE_TRADE_WARS_INFO_DEV');

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Query the overseer object
  const { data: overseerData, isPending: overseerPending, error: overseerError, refetch: overseerRefetch } = useSuiClientQuery(
    'getObject',
    {
      id: overseerId,
      options: {
        showContent: true,
        showDisplay: true,
        showOwner: true,
        showType: true,
      },
    },
    {
      enabled: !!overseerId,
    },
  );

  // Query the TradeWarsInfo object
  const { data: tradeWarsInfoData, isPending: infoPending, error: infoError } = useSuiClientQuery(
    'getObject',
    {
      id: tradeWarsInfoId,
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!tradeWarsInfoId,
    },
  );

  // Extract joined universe IDs from overseer object
  useEffect(() => {
    if (overseerData?.data?.content && 'fields' in overseerData.data.content) {
      const fields = overseerData.data.content.fields as any;
      if (fields.universes && Array.isArray(fields.universes)) {
        setJoinedUniverseIds(fields.universes);
      }
    }
  }, [overseerData]);

  // Get open universe IDs from TradeWarsInfo
  const openUniverseIds: string[] = useMemo(() => {
    if (tradeWarsInfoData?.data?.content && 'fields' in tradeWarsInfoData.data.content) {
      const fields = tradeWarsInfoData.data.content.fields as any;
      if (fields.open_universes && Array.isArray(fields.open_universes)) {
        return fields.open_universes;
      }
    }
    return [];
  }, [tradeWarsInfoData]);

  // Filter out joined universes from open universes
  const availableUniverseIds = useMemo(() =>
    openUniverseIds.filter(id => !joinedUniverseIds.includes(id)),
    [openUniverseIds, joinedUniverseIds]
  );

  // Query universe objects for display information
  const { data: joinedUniversesData, refetch: joinedRefetch } = useSuiClientQuery(
    'multiGetObjects',
    {
      ids: joinedUniverseIds,
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    },
    {
      enabled: joinedUniverseIds.length > 0,
    },
  );

  const { data: availableUniversesData, refetch: availableRefetch } = useSuiClientQuery(
    'multiGetObjects',
    {
      ids: availableUniverseIds,
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    },
    {
      enabled: availableUniverseIds.length > 0,
    },
  );

  // Helper function to extract universe display data
  const extractUniverseData = useCallback((universeObject: any): UniverseData => {
    const id = universeObject?.data?.objectId || '';
    const content = universeObject?.data?.content;

    let name, galaxies, systems, planets, open;

    if (content && 'fields' in content) {
      const fields = content.fields as any;
      name = fields.name;
      galaxies = Number(fields.galaxies || 0);
      systems = Number(fields.systems || 0);
      planets = Number(fields.planets || 0);
      open = fields.open === true;
    }

    return {
      id,
      name: name || 'Unknown Universe',
      galaxies: galaxies || 0,
      systems: systems || 0,
      planets: planets || 0,
      open: open || false,
    };
  }, []);

  const joinUniverse = useCallback((universe: UniverseData) => {
    if (!account || joiningUniverse) {
      return;
    }

    setJoiningUniverse(universe.id);

    const globalSources = getGlobalElementSources();
    const tx = buildJoinUniverseTx({
      packageId,
      overseerId,
      universeId: universe.id,
      erbiumSource: globalSources.erbium,
      lanthanumSource: globalSources.lanthanum,
      thoriumSource: globalSources.thorium,
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setTimeout(() => {
            overseerRefetch();
            availableRefetch();
            joinedRefetch();
            setJoiningUniverse(null);
          }, 2000);
        },
        onError: () => {
          setJoiningUniverse(null);
        },
      },
    );
  }, [account, joiningUniverse, packageId, overseerId, signAndExecute, overseerRefetch, availableRefetch, joinedRefetch]);

  const refetch = useCallback(async () => {
    await Promise.all([overseerRefetch(), joinedRefetch(), availableRefetch()]);
  }, [overseerRefetch, joinedRefetch, availableRefetch]);

  const joinedUniverses = useMemo(() =>
    joinedUniversesData?.map(extractUniverseData) || [],
    [joinedUniversesData, extractUniverseData]
  );

  const availableUniverses = useMemo(() =>
    availableUniversesData?.map(extractUniverseData) || [],
    [availableUniversesData, extractUniverseData]
  );

  return {
    joinedUniverses,
    availableUniverses,
    isLoading: overseerPending || infoPending,
    error: (overseerError || infoError) as Error | null,
    joiningUniverse,
    joinUniverse,
    refetch,
  };
}
