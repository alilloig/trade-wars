import { Transaction } from '@mysten/sui/transactions';

/**
 * Build transaction to create a new Overseer (vest_overseer)
 */
export function buildVestOverseerTx(packageId: string): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::overseer::vest_overseer`,
  });
  return tx;
}

export interface JoinUniverseParams {
  packageId: string;
  overseerId: string;
  universeId: string;
  erbiumSource: string;
  lanthanumSource: string;
  thoriumSource: string;
}

/**
 * Build transaction to join a universe
 */
export function buildJoinUniverseTx(params: JoinUniverseParams): Transaction {
  const { packageId, overseerId, universeId, erbiumSource, lanthanumSource, thoriumSource } = params;

  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::overseer::join_universe`,
    arguments: [
      tx.object(overseerId),
      tx.object(universeId),
      tx.object(erbiumSource),
      tx.object(lanthanumSource),
      tx.object(thoriumSource),
      tx.object.random(),
      tx.object.clock(),
    ],
  });

  return tx;
}

/**
 * Build transaction to get universe planets (for devInspect)
 */
export function buildGetUniversePlanetsTx(
  packageId: string,
  overseerId: string,
  universeId: string
): Transaction {
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::overseer::get_universe_planets`,
    arguments: [
      tx.object(overseerId),
      tx.pure.address(universeId),
    ],
  });
  return tx;
}
