import { SuiObjectResponse } from '@mysten/sui/client';
import { UniverseData, OverseerData, PlanetData } from '../../types';

/**
 * Extract universe data from a Sui object response
 */
export function extractUniverseData(obj: SuiObjectResponse): UniverseData {
  const id = obj.data?.objectId || '';

  if (!obj.data?.content || obj.data.content.dataType !== 'moveObject') {
    return createEmptyUniverseData(id);
  }

  const fields = obj.data.content.fields as any;

  return {
    id,
    name: fields.name || 'Unknown Universe',
    galaxies: Number(fields.galaxies || 0),
    systems: Number(fields.systems || 0),
    planets: Number(fields.planets || 0),
    open: Boolean(fields.open),
    erbiumSource: fields.erbium_source || '',
    lanthanumSource: fields.lanthanum_source || '',
    thoriumSource: fields.thorium_source || '',
  };
}

/**
 * Extract overseer data from a Sui object response
 */
export function extractOverseerData(obj: SuiObjectResponse): OverseerData {
  const id = obj.data?.objectId || '';

  if (!obj.data?.content || obj.data.content.dataType !== 'moveObject') {
    return { id, universes: [], planets: {} };
  }

  const fields = obj.data.content.fields as any;

  return {
    id,
    universes: Array.isArray(fields.universes) ? fields.universes : [],
    planets: fields.planets || {},
  };
}

/**
 * Extract planet info from a Sui object response
 */
export function extractPlanetInfo(obj: SuiObjectResponse, imageIndex: number): PlanetData {
  const id = obj.data?.objectId || '';

  if (!obj.data?.content || obj.data.content.dataType !== 'moveObject') {
    return { id, galaxy: 0, system: 0, position: 0, imageIndex };
  }

  const fields = obj.data.content.fields as any;
  const info = fields.info?.fields || {};

  return {
    id,
    galaxy: Number(info.galaxy || 0),
    system: Number(info.system || 0),
    position: Number(info.position || 0),
    imageIndex,
  };
}

/**
 * Get element sources from universe data
 */
export function getElementSources(universeData: any): {
  erbium: string;
  lanthanum: string;
  thorium: string;
} | null {
  if (!universeData?.data?.content || universeData.data.content.dataType !== 'moveObject') {
    return null;
  }

  const fields = universeData.data.content.fields as any;

  return {
    erbium: fields.erbium_source || '',
    lanthanum: fields.lanthanum_source || '',
    thorium: fields.thorium_source || '',
  };
}

// Helper functions

function createEmptyUniverseData(id: string): UniverseData {
  return {
    id,
    name: 'Unknown Universe',
    galaxies: 0,
    systems: 0,
    planets: 0,
    open: false,
    erbiumSource: '',
    lanthanumSource: '',
    thoriumSource: '',
  };
}
