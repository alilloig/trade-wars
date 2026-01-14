import { PlanetReserves, ElementType } from '../../types';

/**
 * Check if a planet has enough resources for an upgrade
 */
export function canAffordUpgrade(
  reserves: PlanetReserves,
  costs: { erbium: number; lanthanum: number; thorium: number }
): boolean {
  return (
    reserves.erbium >= costs.erbium &&
    reserves.lanthanum >= costs.lanthanum &&
    reserves.thorium >= costs.thorium
  );
}

/**
 * Get planet image path based on image index
 */
export function getPlanetImage(imageIndex: number): string {
  return `/planet${imageIndex}.png`;
}

/**
 * Get element color for styling
 */
export function getElementColor(elementType: ElementType): string {
  const colors = {
    erbium: '#ff6347',
    lanthanum: '#00ff7f',
    thorium: '#8a2be2',
  };
  return colors[elementType];
}
