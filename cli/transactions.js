import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GAME_ADMIN_SECRET_KEY = process.env.GAME_ADMIN_SECRET_KEY;
const GAME_ADMIN_ADDRESS = process.env.GAME_ADMIN_ADDRESS;
const TRADE_WARS_PKG = process.env.TRADE_WARS_PKG;
const TRADE_WARS_ID = process.env.TRADE_WARS_ID;
const ADM_CAP_ID = process.env.ADM_CAP_ID;
const ERB_CAP_ID = process.env.ERB_CAP_ID;
const LAN_CAP_ID = process.env.LAN_CAP_ID;
const THO_CAP_ID = process.env.THO_CAP_ID;

// Keypair from an existing secret key (Uint8Array)
const keypair = Ed25519Keypair.fromSecretKey(GAME_ADMIN_SECRET_KEY);

// create a new SuiClient object pointing to the network you want to use
const client = new SuiClient({ url: getFullnodeUrl('devnet') });

// Function to update .env file with new values
function updateEnvFile(newValues) {
    const envPath = path.resolve('.env');
    let envContent = '';
    
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
        console.log('Creating new .env file...');
    }
    
    // Parse existing env content
    const envLines = envContent.split('\n');
    const envVars = {};
    
    envLines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
    
    // Update with new values
    Object.assign(envVars, newValues);
    
    // Write back to file
    const newEnvContent = Object.entries(envVars)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    
    fs.writeFileSync(envPath, newEnvContent);
    console.log('Updated .env file with new source IDs');
}

// Create element sources transaction function
export async function createElementSources() {
    // Validate that all required environment variables are set
    const requiredEnvVars = {
        TRADE_WARS_PKG,
        TRADE_WARS_ID,
        ADM_CAP_ID,
        ERB_CAP_ID,
        LAN_CAP_ID,
        THO_CAP_ID
    };
    
    for (const [name, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
            throw new Error(`Missing required environment variable: ${name}`);
        }
    }
    
    console.log('Using environment variables:');
    console.log('TRADE_WARS_ID:', TRADE_WARS_ID);
    console.log('ADM_CAP_ID:', ADM_CAP_ID);
    console.log('ERB_CAP_ID:', ERB_CAP_ID);
    console.log('LAN_CAP_ID:', LAN_CAP_ID);
    console.log('THO_CAP_ID:', THO_CAP_ID);
    
    const sources_tx = new Transaction();
    
    // Set explicit gas budget (100 million MIST = 0.1 SUI)
    // sources_tx.setGasBudget(100000000);
    
    // Construct the method name string
    let createElementSourcesCall = TRADE_WARS_PKG+'::trade_wars::create_element_sources';

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
    const result = await client.signAndExecuteTransaction({
        transaction: sources_tx,
        signer: keypair,
        requestType: 'WaitForLocalExecution',
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
        },
    });

    console.log('Element sources created successfully!');
    console.log('Transaction digest:', result.digest);
    
    // Extract the created source IDs from the transaction result
    const createdObjects = result.objectChanges?.filter(change => change.type === 'created') || [];
    
    if (createdObjects.length >= 3) {
        const sourceIds = createdObjects.slice(0, 3).map(obj => obj.objectId);
        
        // Update .env file with the source IDs
        updateEnvFile({
            ERB_SOURCE_ID: sourceIds[0],
            LAN_SOURCE_ID: sourceIds[1],
            THO_SOURCE_ID: sourceIds[2]
        });
        
        console.log('Source IDs saved to .env:');
        console.log('ERB_SOURCE_ID:', sourceIds[0]);
        console.log('LAN_SOURCE_ID:', sourceIds[1]);
        console.log('THO_SOURCE_ID:', sourceIds[2]);
    } else {
        console.warn('Warning: Expected 3 created objects, but got', createdObjects.length);
        console.log('Created objects:', createdObjects);
    }
    
    return result;
}

// Start universe transaction function
export async function startUniverse() {
    // Reload environment variables to get the latest source IDs
    dotenv.config({ override: true });
    
    const ERB_SOURCE_ID = process.env.ERB_SOURCE_ID;
    const LAN_SOURCE_ID = process.env.LAN_SOURCE_ID;
    const THO_SOURCE_ID = process.env.THO_SOURCE_ID;
    
    // Check if source IDs are available in the environment
    if (!ERB_SOURCE_ID || !LAN_SOURCE_ID || !THO_SOURCE_ID) {
        throw new Error(
            'Source IDs not found in .env file. Please run "create-sources" command first.\n' +
            'Missing: ' + [
                !ERB_SOURCE_ID && 'ERB_SOURCE_ID',
                !LAN_SOURCE_ID && 'LAN_SOURCE_ID', 
                !THO_SOURCE_ID && 'THO_SOURCE_ID'
            ].filter(Boolean).join(', ')
        );
    }

    console.log('Using source IDs from .env:');
    console.log('ERB_SOURCE_ID:', ERB_SOURCE_ID);
    console.log('LAN_SOURCE_ID:', LAN_SOURCE_ID);
    console.log('THO_SOURCE_ID:', THO_SOURCE_ID);

    const start_universe_tx = new Transaction();
    
    // Set explicit gas budget (100 million MIST = 0.1 SUI)
    // start_universe_tx.setGasBudget(100000000);
    
    // Construct the method name string
    let startUniverseCall = TRADE_WARS_PKG+'::trade_wars::admin_start_universe';
    
    // Add a moveCall to the transaction
    start_universe_tx.moveCall({
        target: startUniverseCall,
        arguments: [
            start_universe_tx.object(TRADE_WARS_ID),
            start_universe_tx.object(ADM_CAP_ID),
            start_universe_tx.object(ERB_SOURCE_ID),
            start_universe_tx.object(LAN_SOURCE_ID),
            start_universe_tx.object(THO_SOURCE_ID),
            start_universe_tx.pure('string', 'Alpha'),
            start_universe_tx.pure('u8', 8),
            start_universe_tx.pure('u8', 128),
            start_universe_tx.pure('u8', 16),
            start_universe_tx.object.clock()
        ],
    });

    // Sign and execute the transaction
    const result = await client.signAndExecuteTransaction({
        transaction: start_universe_tx,
        signer: keypair,
        requestType: 'WaitForLocalExecution',
        options: {
            showEffects: true,
            showEvents: true,
        },
    });

    console.log('Universe started successfully!');
    console.log('Transaction digest:', result.digest);
    return result;
}
