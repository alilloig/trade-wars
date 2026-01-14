/**
 * Format a number with commas as thousands separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format resource amount with appropriate suffix (K, M, B)
 */
export function formatResourceAmount(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K`;
  }
  return amount.toString();
}

/**
 * Format a large number to a shorter readable string
 */
export function formatCompact(num: number): string {
  if (num >= 1_000_000) {
    return formatResourceAmount(num);
  }
  return formatNumber(num);
}
