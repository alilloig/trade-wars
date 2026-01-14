import { useState, useCallback } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getEnvVar, getGlobalElementSources } from '../constants/env';
import { buildUpgradeMineTx } from '../services/sui/transactions';
import { ElementType, PlanetReserves, UpgradeCosts } from '../types';

interface UseMineUpgradeProps {
  planetId: string;
  overseerId: string;
  universeId: string;
  reserves: PlanetReserves;
  upgradeCosts: UpgradeCosts;
  onSuccess?: () => void;
}

interface UseMineUpgradeReturn {
  upgradeMine: (mineType: ElementType) => void;
  canAfford: (mineType: ElementType) => boolean;
  isUpgrading: ElementType | null;
  status: string;
}

export function useMineUpgrade({
  planetId,
  overseerId,
  universeId,
  reserves,
  upgradeCosts,
  onSuccess,
}: UseMineUpgradeProps): UseMineUpgradeReturn {
  const account = useCurrentAccount();
  const [isUpgrading, setIsUpgrading] = useState<ElementType | null>(null);
  const [status, setStatus] = useState('');

  const packageId = getEnvVar('VITE_TRADE_WARS_PKG_DEV');
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const canAfford = useCallback((mineType: ElementType): boolean => {
    const costs = upgradeCosts[mineType];
    return (
      reserves.erbium >= costs.erbium &&
      reserves.lanthanum >= costs.lanthanum &&
      reserves.thorium >= costs.thorium
    );
  }, [reserves, upgradeCosts]);

  const upgradeMine = useCallback((mineType: ElementType) => {
    if (!account) {
      setStatus('No account connected');
      return;
    }

    if (isUpgrading) {
      setStatus('Already upgrading a mine');
      return;
    }

    if (!canAfford(mineType)) {
      setStatus(`Not enough resources to upgrade ${mineType} mine`);
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    setIsUpgrading(mineType);
    setStatus(`Upgrading ${mineType} mine...`);

    const globalSources = getGlobalElementSources();
    const tx = buildUpgradeMineTx(mineType, {
      packageId,
      overseerId,
      universeId,
      planetId,
      erbiumSource: globalSources.erbium,
      lanthanumSource: globalSources.lanthanum,
      thoriumSource: globalSources.thorium,
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          setStatus(`${mineType} mine upgraded successfully!`);
          setTimeout(() => {
            onSuccess?.();
            setIsUpgrading(null);
            setStatus('');
          }, 2000);
        },
        onError: (error) => {
          setStatus(`Failed to upgrade ${mineType} mine: ${error.message}`);
          setIsUpgrading(null);
          setTimeout(() => setStatus(''), 5000);
        },
      },
    );
  }, [
    account,
    isUpgrading,
    canAfford,
    packageId,
    overseerId,
    universeId,
    planetId,
    signAndExecute,
    onSuccess,
  ]);

  return {
    upgradeMine,
    canAfford,
    isUpgrading,
    status,
  };
}
