import { bcs } from '@mysten/sui/bcs';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { PlanetReserves, MineLevels, UpgradeCosts } from '../../types';

/**
 * Parse u64 value from devInspect return value using SDK's BCS module
 */
export function parseU64(returnValue: number[]): number {
  try {
    return Number(bcs.U64.parse(new Uint8Array(returnValue)));
  } catch (error) {
    console.error('Failed to parse U64:', error);
    return 0;
  }
}

/**
 * Parse vector<address> from devInspect return value using SDK's BCS module
 */
export function parseVectorOfIds(returnValue: number[]): string[] {
  try {
    return bcs.vector(bcs.Address).parse(new Uint8Array(returnValue));
  } catch (error) {
    console.error('Failed to parse vector<address>:', error);
    return [];
  }
}

/**
 * Get planet fields directly from object (no devInspect needed for static data)
 */
export async function getPlanetFields(client: SuiClient, planetId: string) {
  const object = await client.getObject({
    id: planetId,
    options: { showContent: true }
  });

  if (!object.data?.content || object.data.content.dataType !== 'moveObject') {
    throw new Error('Invalid planet object');
  }

  const fields = object.data.content.fields as any;

  return {
    info: fields.info?.fields || {},
    systemSize: Number(fields.system_size || 0),
    // Mine data - can be read directly
    erbiumMine: fields.erbium_mine?.fields || {},
    lanthanumMine: fields.lanthanum_mine?.fields || {},
    thoriumMine: fields.thorium_mine?.fields || {},
  };
}

/**
 * Get mine levels and upgrade costs from planet object fields (no devInspect)
 */
export function extractMineLevelsAndCosts(planetFields: any): { levels: MineLevels; costs: UpgradeCosts } {
  const erbiumMine = planetFields.erbiumMine;
  const lanthanumMine = planetFields.lanthanumMine;
  const thoriumMine = planetFields.thoriumMine;

  return {
    levels: {
      erbium: Number(erbiumMine.level || 0),
      lanthanum: Number(lanthanumMine.level || 0),
      thorium: Number(thoriumMine.level || 0),
    },
    costs: {
      erbium: {
        erbium: Number(erbiumMine.erbium_upgrade_cost || 0),
        lanthanum: Number(erbiumMine.lanthanum_upgrade_cost || 0),
        thorium: Number(erbiumMine.thorium_upgrade_cost || 0),
      },
      lanthanum: {
        erbium: Number(lanthanumMine.erbium_upgrade_cost || 0),
        lanthanum: Number(lanthanumMine.lanthanum_upgrade_cost || 0),
        thorium: Number(lanthanumMine.thorium_upgrade_cost || 0),
      },
      thorium: {
        erbium: Number(thoriumMine.erbium_upgrade_cost || 0),
        lanthanum: Number(thoriumMine.lanthanum_upgrade_cost || 0),
        thorium: Number(thoriumMine.thorium_upgrade_cost || 0),
      },
    },
  };
}

/**
 * Get planet reserves (time-dependent, requires devInspect)
 * Batches all 3 reserve calls in ONE transaction
 */
export async function getPlanetReservesComputed(
  client: SuiClient,
  packageId: string,
  planetId: string,
  sender: string
): Promise<PlanetReserves> {
  const tx = new Transaction();

  // Batch all reserve calls in ONE transaction (not 15!)
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

  const result = await client.devInspectTransactionBlock({
    sender,
    transactionBlock: tx
  });

  // Use SDK's BCS deserialization instead of manual byte parsing
  const erbiumBytes = result.results?.[0]?.returnValues?.[0]?.[0] || [];
  const lanthanumBytes = result.results?.[1]?.returnValues?.[0]?.[0] || [];
  const thoriumBytes = result.results?.[2]?.returnValues?.[0]?.[0] || [];

  return {
    erbium: parseU64(erbiumBytes),
    lanthanum: parseU64(lanthanumBytes),
    thorium: parseU64(thoriumBytes),
  };
}

/**
 * Get planet IDs for a universe (requires devInspect for computed list)
 */
export async function getUniversePlanetIds(
  client: SuiClient,
  packageId: string,
  overseerId: string,
  universeId: string,
  sender: string
): Promise<string[]> {
  const tx = new Transaction();

  tx.moveCall({
    target: `${packageId}::overseer::get_universe_planets`,
    arguments: [
      tx.object(overseerId),
      tx.pure.address(universeId)
    ]
  });

  const result = await client.devInspectTransactionBlock({
    sender,
    transactionBlock: tx
  });

  const bytes = result.results?.[0]?.returnValues?.[0]?.[0] || [];
  return parseVectorOfIds(bytes);
}
