/**
 * Truncate a Sui address for display
 * e.g., "0x1234...5678"
 */
export function truncateAddress(address: string, prefixLength: number = 6, suffixLength: number = 4): string {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;

  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Get Sui explorer URL for an object
 */
export function getExplorerUrl(objectId: string, network: string = 'devnet'): string {
  return `https://${network}.suivision.xyz/object/${objectId}`;
}
