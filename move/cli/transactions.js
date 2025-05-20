import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV1 } from '@mysten/sui/faucet';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import dotenv from 'dotenv';

dotenv.config();
 
const GAME_ADMIN_ADDRESS = process.env.GAME_ADMIN_ADDRESS;
 
// create a new SuiClient object pointing to the network you want to use
const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') });

export const balance = await 
    suiClient.getBalance({
		owner: GAME_ADMIN_ADDRESS,
	}
);