import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';

dotenv.config();

const GAME_ADMIN_SECRET_KEY = process.env.GAME_ADMIN_SECRET_KEY;
const GAME_ADMIN_ADDRESS = process.env.GAME_ADMIN_ADDRESS;
const TRADE_WARS_ID = process.env.TRADE_WARS_ID;
const GAME_ADMIN_CAPABILITY_ID = process.env.GAME_ADMIN_CAPABILITY_ID;
const ERBIUM_TREASURY_ID = process.env.ERBIUM_TREASURY_ID;
const LANTHANUM_TREASURY_ID = process.env.LANTHANUM_TREASURY_ID;
const THORIUM_TREASURY_ID = process.env.THORIUM_TREASURY_ID;

// Keypair from an existing secret key (Uint8Array)
const keypair = Ed25519Keypair.fromSecretKey(GAME_ADMIN_SECRET_KEY);

// Create element sources transaction
const sources_tx = new Transaction();
// Construct the method name string
let createElementSourcesCall = TRADE_WARS_ID+'::trade_wars::create_element_sources';
// Add a moveCall to the transaction
sources_tx.moveCall({
	target: createElementSourcesCall,
	arguments: [
        sources_tx.object(TRADE_WARS_ID),
        sources_tx.object(GAME_ADMIN_CAPABILITY_ID), 
        sources_tx.object(ERBIUM_TREASURY_ID), 
        sources_tx.object(LANTHANUM_TREASURY_ID), 
        sources_tx.object(THORIUM_TREASURY_ID)],
});
// Sign and execute the transaction
// const [erb_source_id, lan_source_id, tho_source_id]
export const sources = await client.signAndExecuteTransactionBlock({
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
        start_universe_tx.object(GAME_ADMIN_CAPABILITY_ID),
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
export const universe = await client.signAndExecuteTransactionBlock({
	transaction: start_universe_tx,
    signer: keypair,
	requestType: 'WaitForLocalExecution',
    options: {
		showEffects: true,
        showEvents: true,
    },
});
