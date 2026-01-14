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

/**
 * Global element sources - shared across all universes.
 * With mint-on-demand, all mines use these global sources directly.
 */
export function getGlobalElementSources(): {
  erbium: string;
  lanthanum: string;
  thorium: string;
} {
  return {
    erbium: getEnvVar('VITE_ERBIUM_SOURCE_ID'),
    lanthanum: getEnvVar('VITE_LANTHANUM_SOURCE_ID'),
    thorium: getEnvVar('VITE_THORIUM_SOURCE_ID'),
  };
}
