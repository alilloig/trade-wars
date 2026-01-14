export function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export function usePackageId(): string {
  return getEnvVar('VITE_TRADE_WARS_PKG_DEV');
}

export function useTradeWarsId(): string {
  return getEnvVar('VITE_TRADE_WARS_ID_DEV');
}

export function useTradeWarsInfoId(): string {
  return getEnvVar('VITE_TRADE_WARS_INFO_DEV');
}
