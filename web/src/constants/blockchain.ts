import { ElementType } from '../types';

export const CONTRACT_MODULES = {
  overseer: 'overseer',
  planet: 'planet',
  universe: 'universe',
  tradeWars: 'trade_wars',
} as const;

export const ENTRY_FUNCTIONS = {
  vestOverseer: 'vest_overseer',
  joinUniverse: 'join_universe',
  upgradeErbiumMine: 'upgrade_erbium_planet_mine',
  upgradeLanthanumMine: 'upgrade_lanthanum_planet_mine',
  upgradeThoriumMine: 'upgrade_thorium_planet_mine',
} as const;

export const VIEW_FUNCTIONS = {
  getErbiumReserves: 'get_erbium_reserves',
  getLanthanumReserves: 'get_lanthanum_reserves',
  getThoriumReserves: 'get_thorium_reserves',
  getUniversePlanets: 'get_universe_planets',
} as const;

export function getUpgradeFunctionName(elementType: ElementType): string {
  const map = {
    erbium: ENTRY_FUNCTIONS.upgradeErbiumMine,
    lanthanum: ENTRY_FUNCTIONS.upgradeLanthanumMine,
    thorium: ENTRY_FUNCTIONS.upgradeThoriumMine,
  };
  return map[elementType];
}
