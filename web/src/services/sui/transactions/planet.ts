import { Transaction } from '@mysten/sui/transactions';
import { ElementType } from '../../../types';

export interface UpgradeMineParams {
  packageId: string;
  overseerId: string;
  universeId: string;
  planetId: string;
  erbiumSource: string;
  lanthanumSource: string;
  thoriumSource: string;
}

/**
 * Build transaction to upgrade a specific mine type
 */
export function buildUpgradeMineTx(
  mineType: ElementType,
  params: UpgradeMineParams
): Transaction {
  const { packageId, overseerId, universeId, planetId, erbiumSource, lanthanumSource, thoriumSource } = params;

  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::overseer::upgrade_${mineType}_planet_mine`,
    arguments: [
      tx.object(overseerId),
      tx.pure.address(universeId),
      tx.object(planetId),
      tx.object(erbiumSource),
      tx.object(lanthanumSource),
      tx.object(thoriumSource),
      tx.object.clock(),
    ],
  });

  return tx;
}

/**
 * Build transaction to get planet reserves (for devInspect)
 * Only 3 calls - reserves are time-dependent computed values
 */
export function buildPlanetReservesTx(packageId: string, planetId: string): Transaction {
  const tx = new Transaction();

  // Only time-dependent reserves need devInspect
  tx.moveCall({
    target: `${packageId}::planet::get_erbium_reserves`,
    arguments: [tx.object(planetId), tx.object.clock()]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_lanthanum_reserves`,
    arguments: [tx.object(planetId), tx.object.clock()]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_thorium_reserves`,
    arguments: [tx.object(planetId), tx.object.clock()]
  });

  return tx;
}

/**
 * Build transaction to get all planet data (for legacy compatibility)
 * This includes reserves, mine levels, and upgrade costs
 * Note: Mine levels and upgrade costs can also be read via getObject
 */
export function buildPlanetDataTx(packageId: string, planetId: string): Transaction {
  const tx = new Transaction();

  // Reserves (time-dependent - need devInspect)
  tx.moveCall({
    target: `${packageId}::planet::get_erbium_reserves`,
    arguments: [tx.object(planetId), tx.object.clock()]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_lanthanum_reserves`,
    arguments: [tx.object(planetId), tx.object.clock()]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_thorium_reserves`,
    arguments: [tx.object(planetId), tx.object.clock()]
  });

  // Mine levels (static - could use getObject, but included for batching)
  tx.moveCall({
    target: `${packageId}::planet::get_erbium_mine_level`,
    arguments: [tx.object(planetId)]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_lanthanum_mine_level`,
    arguments: [tx.object(planetId)]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_thorium_mine_level`,
    arguments: [tx.object(planetId)]
  });

  // Erbium mine upgrade costs
  tx.moveCall({
    target: `${packageId}::planet::get_erbium_mine_erbium_upgrade_cost`,
    arguments: [tx.object(planetId)]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_erbium_mine_lanthanum_upgrade_cost`,
    arguments: [tx.object(planetId)]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_erbium_mine_thorium_upgrade_cost`,
    arguments: [tx.object(planetId)]
  });

  // Lanthanum mine upgrade costs
  tx.moveCall({
    target: `${packageId}::planet::get_lanthanum_mine_erbium_upgrade_cost`,
    arguments: [tx.object(planetId)]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_lanthanum_mine_lanthanum_upgrade_cost`,
    arguments: [tx.object(planetId)]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_lanthanum_mine_thorium_upgrade_cost`,
    arguments: [tx.object(planetId)]
  });

  // Thorium mine upgrade costs
  tx.moveCall({
    target: `${packageId}::planet::get_thorium_mine_erbium_upgrade_cost`,
    arguments: [tx.object(planetId)]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_thorium_mine_lanthanum_upgrade_cost`,
    arguments: [tx.object(planetId)]
  });
  tx.moveCall({
    target: `${packageId}::planet::get_thorium_mine_thorium_upgrade_cost`,
    arguments: [tx.object(planetId)]
  });

  return tx;
}
