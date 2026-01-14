import { useState, useEffect, useRef, useCallback } from 'react';
import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getEnvVar } from '../constants/env';
import { buildVestOverseerTx } from '../services/sui/transactions';

interface OverseerObject {
  objectId: string;
  content?: any;
  display?: any;
}

interface UseOverseerReturn {
  overseers: OverseerObject[];
  isLoading: boolean;
  error: Error | null;
  isCreating: boolean;
  creationStatus: string;
  createOverseer: () => void;
  refetch: () => Promise<void>;
}

export function useOverseer(): UseOverseerReturn {
  const account = useCurrentAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState('');
  const pollingTimeoutRef = useRef<number | undefined>(undefined);

  const packageId = getEnvVar('VITE_TRADE_WARS_PKG_DEV');
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const { data, isPending, error, refetch } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address as string,
      filter: {
        MatchAll: [
          {
            StructType: `${packageId}::overseer::Overseer`,
          },
        ],
      },
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    },
    {
      enabled: !!account && !!packageId,
    },
  );

  // Clean up polling timeout on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const startPollingForNewOverseer = useCallback((expectedCount: number) => {
    let pollCount = 0;
    const maxPolls = 10;

    const poll = () => {
      pollCount++;
      setCreationStatus(`Waiting for blockchain confirmation... (${pollCount}/${maxPolls})`);

      refetch().then((result) => {
        if (result.data?.data && result.data.data.length > expectedCount) {
          setCreationStatus('Overseer created successfully!');
          setIsCreating(false);
          setTimeout(() => setCreationStatus(''), 3000);
        } else if (pollCount < maxPolls) {
          pollingTimeoutRef.current = window.setTimeout(poll, 2000);
        } else {
          setCreationStatus('Transaction may still be processing. Please refresh manually if needed.');
          setIsCreating(false);
          setTimeout(() => setCreationStatus(''), 5000);
        }
      }).catch(() => {
        setCreationStatus('Error checking for new overseer. Please refresh manually.');
        setIsCreating(false);
        setTimeout(() => setCreationStatus(''), 5000);
      });
    };

    pollingTimeoutRef.current = window.setTimeout(poll, 2000);
  }, [refetch]);

  const createOverseer = useCallback(() => {
    if (!packageId || isCreating) return;

    const currentCount = data?.data?.length || 0;
    setIsCreating(true);
    setCreationStatus('Submitting transaction...');

    const tx = buildVestOverseerTx(packageId);

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setCreationStatus('Transaction submitted! Waiting for confirmation...');
          startPollingForNewOverseer(currentCount);
        },
        onError: () => {
          setCreationStatus('Failed to create overseer. Please try again.');
          setIsCreating(false);
          setTimeout(() => setCreationStatus(''), 5000);
        },
      },
    );
  }, [packageId, isCreating, data?.data?.length, signAndExecute, startPollingForNewOverseer]);

  const overseers: OverseerObject[] = (data?.data || []).map((obj) => ({
    objectId: obj.data?.objectId || '',
    content: obj.data?.content,
    display: obj.data?.display,
  }));

  return {
    overseers,
    isLoading: isPending,
    error: error as Error | null,
    isCreating,
    creationStatus,
    createOverseer,
    refetch: async () => { await refetch(); },
  };
}
