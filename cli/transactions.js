import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GAME_ADMIN_SECRET_KEY = process.env.GAME_ADMIN_SECRET_KEY;
const TRADE_WARS_PKG = process.env.TRADE_WARS_PKG;
const TRADE_WARS_ID = process.env.TRADE_WARS_ID;
const ADM_CAP_ID = process.env.ADM_CAP_ID;
const ERB_CAP_ID = process.env.ERB_CAP_ID;
const LAN_CAP_ID = process.env.LAN_CAP_ID;
const THO_CAP_ID = process.env.THO_CAP_ID;

// Helper function to get keypair and client
function getClientAndKeypair() {
    if (!GAME_ADMIN_SECRET_KEY) {
        throw new Error('GAME_ADMIN_SECRET_KEY environment variable is required');
    }
    
    // Keypair from an existing secret key (Uint8Array)
    const keypair = Ed25519Keypair.fromSecretKey(GAME_ADMIN_SECRET_KEY);

    // create a new SuiClient object pointing to the network you want to use
    const client = new SuiClient({ url: getFullnodeUrl('devnet') });
    
    return { client, keypair };
}

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

// Function to update tx-digests.json file
function updateTxDigestsFile(transactionName, digest) {
    const txDigestsPath = path.resolve('tx-digests.json');
    let txDigests = {};
    
    try {
        const content = fs.readFileSync(txDigestsPath, 'utf8');
        txDigests = JSON.parse(content);
    } catch (error) {
        console.log('Creating new tx-digests.json file...');
    }
    
    // Add new transaction with current timestamp
    txDigests[transactionName] = {
        digest: digest,
        timestamp: new Date().toISOString()
    };
    
    // Write back to file with proper formatting
    fs.writeFileSync(txDigestsPath, JSON.stringify(txDigests, null, 4));
    console.log(`Transaction digest saved to tx-digests.json: ${transactionName}`);
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
    
    const { client, keypair } = getClientAndKeypair();
    
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
            showReturnValues: true,
        },
    });

    console.log('Element sources created successfully!');
    console.log('Transaction digest:', result.digest);
    
    // Extract the source IDs from the Move call return values
    // The Move function returns (erb_source_id, lan_source_id, tho_source_id)
    if (result.effects?.transactionDigest && result.returnValues && result.returnValues.length >= 3) {
        // Parse the return values - they come as BCS encoded values
        const erbSourceId = '0x' + Buffer.from(result.returnValues[0][0]).toString('hex');
        const lanSourceId = '0x' + Buffer.from(result.returnValues[1][0]).toString('hex');
        const thoSourceId = '0x' + Buffer.from(result.returnValues[2][0]).toString('hex');
        
        // Update .env file with the source IDs in correct order
        updateEnvFile({
            ERB_SOURCE_ID: erbSourceId,
            LAN_SOURCE_ID: lanSourceId,
            THO_SOURCE_ID: thoSourceId
        });
        
        console.log('Source IDs saved to .env (from return values):');
        console.log('ERB_SOURCE_ID:', erbSourceId);
        console.log('LAN_SOURCE_ID:', lanSourceId);
        console.log('THO_SOURCE_ID:', thoSourceId);
    } else {
        // Fail to get return values
        console.warn('Warning: Could not persist source IDs to .env file');
    }
    
    // Update tx-digests.json file
    updateTxDigestsFile('create-sources', result.digest);
    
    return result;
}

// Start universe transaction function
export async function startUniverse({ name, galaxies, systems, planets }) {
    // Validate parameters
    if (!name || typeof name !== 'string') {
        throw new Error('Universe name is required and must be a string');
    }
    if (!galaxies || !Number.isInteger(galaxies) || galaxies < 1 || galaxies > 255) {
        throw new Error('Galaxies must be an integer between 1 and 255');
    }
    if (!systems || !Number.isInteger(systems) || systems < 1 || systems > 255) {
        throw new Error('Systems must be an integer between 1 and 255');
    }
    if (!planets || !Number.isInteger(planets) || planets < 1 || planets > 255) {
        throw new Error('Planets must be an integer between 1 and 255');
    }

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

    console.log(`Creating universe "${name}" with ${galaxies} galaxies, ${systems} systems, and ${planets} planets...`);

    const { client, keypair } = getClientAndKeypair();
    
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
            start_universe_tx.pure('string', name),
            start_universe_tx.pure('u8', galaxies),
            start_universe_tx.pure('u8', systems),
            start_universe_tx.pure('u8', planets),
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
            showObjectChanges: true,
            showReturnValues: true,
        },
    });

    console.log('Universe started successfully!');
    console.log('Transaction digest:', result.digest);
    
    // Extract the IDs from the Move call return values
    // The Move function returns (universe_id, erb_universe_source_id, lan_universe_source_id, tho_universe_source_id)
    if (result.effects?.transactionDigest && result.returnValues && result.returnValues.length >= 4) {
        // Parse the return values - they come as BCS encoded values
        const universeId = '0x' + Buffer.from(result.returnValues[0][0]).toString('hex');
        const universeErbSourceId = '0x' + Buffer.from(result.returnValues[1][0]).toString('hex');
        const universeLanSourceId = '0x' + Buffer.from(result.returnValues[2][0]).toString('hex');
        const universeThoSourceId = '0x' + Buffer.from(result.returnValues[3][0]).toString('hex');
        
        // Create environment variable names with universe name prefix
        const namePrefix = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        const envVars = {
            [`${namePrefix}_UNIVERSE_ID`]: universeId,
            [`${namePrefix}_UNIVERSE_ERB_SOURCE_ID`]: universeErbSourceId,
            [`${namePrefix}_UNIVERSE_LAN_SOURCE_ID`]: universeLanSourceId,
            [`${namePrefix}_UNIVERSE_THO_SOURCE_ID`]: universeThoSourceId
        };
        
        // Update .env file with the universe IDs with name prefix
        updateEnvFile(envVars);
        
        console.log('Universe IDs saved to .env (from return values):');
        Object.entries(envVars).forEach(([key, value]) => {
            console.log(`${key}:`, value);
        });
    } else {
        // Fail to get returned values
        console.warn('Warning: Could not persist universe IDs to .env file');
    }
    
    // Update tx-digests.json file
    updateTxDigestsFile(`start-universe-${name.toLowerCase()}`, result.digest);
    
    return result;
}
