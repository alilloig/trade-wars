import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';

dotenv.config();

const GAME_ADMIN_SECRET_KEY = process.env.GAME_ADMIN_SECRET_KEY;
const GAME_ADMIN_ADDRESS = process.env.GAME_ADMIN_ADDRESS;
const TRADE_WARS_ID = process.env.TRADE_WARS_ID;
const ADM_CAP_ID = process.env.ADM_CAP_ID;
const ERB_CAP_ID = process.env.ERB_CAP_ID;
const LAN_CAP_ID = process.env.LAN_CAP_ID;
const THO_CAP_ID = process.env.THO_CAP_ID;

// Keypair from an existing secret key (Uint8Array)
const keypair = Ed25519Keypair.fromSecretKey(GAME_ADMIN_SECRET_KEY);

// create a new SuiClient object pointing to the network you want to use
const client = new SuiClient({ url: getFullnodeUrl('devnet') });

// Create element sources transaction
const sources_tx = new Transaction();
// Construct the method name string
let createElementSourcesCall = TRADE_WARS_ID+'::trade_wars::create_element_sources';

// Add a moveCall to the transaction
sources_tx.moveCall({
	target: createElementSourcesCall,
	arguments: [
        sources_tx.object(TRADE_WARS_ID),
        sources_tx.object(ADM_CAP_ID), 
        sources_tx.object(ERB_CAP_ID), 
        sources_tx.object(LAN_CAP_ID), 
        sources_tx.object(THO_CAP_ID)],
});

// Sign and execute the transaction
// const [erb_source_id, lan_source_id, tho_source_id]
export const sources = await client.signAndExecuteTransaction({
	transaction: sources_tx,
    signer: keypair,
	requestType: 'WaitForLocalExecution',
	options: {
		showEffects: true,
        showEvents: true,
    },
});

// Start universe transaction
const start_universe_tx = new Transaction();
// Construct the method name string
let startUniverseCall = TRADE_WARS_ID+'::trade_wars::admin_start_universe';
// Add a moveCall to the transaction
start_universe_tx.moveCall({
	target: startUniverseCall,
	arguments: [
        start_universe_tx.object(TRADE_WARS_ID),
        start_universe_tx.object(ADM_CAP_ID),
        start_universe_tx.object(sources[0]),
        start_universe_tx.object(sources[1]),
        start_universe_tx.object(sources[2]),
        start_universe_tx.pure('string', 'Alpha'),
        start_universe_tx.pure('u8', 8),
        start_universe_tx.pure('u8', 128),
        start_universe_tx.pure('u8', 16),
        start_universe_tx.object.clock()
    ],
});
// Sign and execute the transaction
export const universe = await client.signAndExecuteTransaction({
	transaction: start_universe_tx,
    signer: keypair,
	requestType: 'WaitForLocalExecution',
    options: {
		showEffects: true,
        showEvents: true,
    },
});
