import { SuiObjectResponse } from '@mysten/sui/client';

export type { SuiObjectResponse };

export interface DevInspectResult {
  effects?: {
    status: { status: string };
  };
  results?: Array<{
    returnValues?: Array<[number[], string]>;
  }>;
}

export interface TransactionParams {
  packageId: string;
  sender: string;
}

export interface JoinUniverseParams extends TransactionParams {
  overseerId: string;
  universeId: string;
  erbiumSource: string;
  lanthanumSource: string;
  thoriumSource: string;
}

export interface UpgradeMineParams extends TransactionParams {
  overseerId: string;
  universeId: string;
  planetId: string;
  erbiumSource: string;
  lanthanumSource: string;
  thoriumSource: string;
}
