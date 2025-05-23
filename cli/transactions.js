import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';
import { updateTxDigestsFile, updateEnvFile, updateWebEnvFile } from './update_files.js';
import { execSync } from 'child_process';

dotenv.config();

const GAME_ADMIN_SECRET_KEY = process.env.GAME_ADMIN_SECRET_KEY;
const TRADE_WARS_PKG = process.env.TRADE_WARS_PKG;
const TRADE_WARS_ID = process.env.TRADE_WARS_ID;
const TRADE_WARS_INFO = process.env.TRADE_WARS_INFO;
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

    // Get the active environment from sui client
    let activeEnv;
    try {
        const output = execSync('sui client active-env', { encoding: 'utf8' });
        // Extract the environment name from the output (remove warnings and whitespace)
        activeEnv = output.split('\n').find(line => 
            line.trim() && 
            !line.includes('warning') && 
            !line.includes('Client/Server')
        )?.trim();
        
        if (!activeEnv) {
            throw new Error('Could not determine active environment');
        }
    } catch (error) {
        console.warn('Failed to get active environment, falling back to devnet:', error.message);
        activeEnv = 'devnet';
    }

    console.log(`Using Sui environment: ${activeEnv}`);

    // create a new SuiClient object pointing to the network you want to use
    const client = new SuiClient({ url: getFullnodeUrl(activeEnv) });
    
    return { client, keypair };
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
        requestType: 'WaitForEffectsCert',
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showReturnValues: true,
        },
    });

    console.log('Element sources created successfully!');
    console.log('Transaction digest:', result.digest);
    
    // Extract created object IDs from the transaction result
    const createdObjects = result.objectChanges?.filter(change => change.type === 'created') || [];
    
    if (createdObjects.length !== 3) {
        throw new Error(`Expected 3 created objects (ERB, LAN, THO sources), but found ${createdObjects.length}`);
    }
    
    console.log('Created objects:', createdObjects);
    
    // Sort objects by objectType to ensure consistent assignment
    // Assuming the contract creates sources in alphabetical order: ERB, LAN, THO
    const sortedObjects = createdObjects.sort((a, b) => a.objectType.localeCompare(b.objectType));
    
    // Extract object IDs
    const erbSourceId = sortedObjects[0].objectId;
    const lanSourceId = sortedObjects[1].objectId;
    const thoSourceId = sortedObjects[2].objectId;
    
    console.log('Source IDs extracted:');
    console.log('ERB_SOURCE_ID:', erbSourceId);
    console.log('LAN_SOURCE_ID:', lanSourceId);
    console.log('THO_SOURCE_ID:', thoSourceId);
    
    // Update CLI .env file
    console.log('\nUpdating CLI .env file...');
    updateEnvFile({
        ERB_SOURCE_ID: erbSourceId,
        LAN_SOURCE_ID: lanSourceId,
        THO_SOURCE_ID: thoSourceId
    });
    
    // Update web .env file
    console.log('Updating web .env file...');
    updateWebEnvFile({
        VITE_ERB_SOURCE_ID_DEV: erbSourceId,
        VITE_LAN_SOURCE_ID_DEV: lanSourceId,
        VITE_THO_SOURCE_ID_DEV: thoSourceId
    });
    
    // Update tx-digests.json file
    updateTxDigestsFile('create-sources', result.digest);
    
    console.log('\n✅ Element sources created and .env files updated successfully!');
    console.log('CLI (.env):');
    console.log(`  ERB_SOURCE_ID=${erbSourceId}`);
    console.log(`  LAN_SOURCE_ID=${lanSourceId}`);
    console.log(`  THO_SOURCE_ID=${thoSourceId}`);
    console.log('\nWeb (.env):');
    console.log(`  VITE_ERB_SOURCE_ID_DEV=${erbSourceId}`);
    console.log(`  VITE_LAN_SOURCE_ID_DEV=${lanSourceId}`);
    console.log(`  VITE_THO_SOURCE_ID_DEV=${thoSourceId}`);
    
    return result;
}

// Start universe transaction function
export async function startUniverse({ name = 'alpha', galaxies = 1, systems = 1, planets = 255, open = true } = {}) {
    // Validate parameters (with defaults applied)
    if (!name || typeof name !== 'string') {
        throw new Error('Universe name is required and must be a string');
    }
    if (!Number.isInteger(galaxies) || galaxies < 1 || galaxies > 255) {
        throw new Error('Galaxies must be an integer between 1 and 255');
    }
    if (!Number.isInteger(systems) || systems < 1 || systems > 255) {
        throw new Error('Systems must be an integer between 1 and 255');
    }
    if (!Number.isInteger(planets) || planets < 1 || planets > 255) {
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
            start_universe_tx.pure('bool', false),
            start_universe_tx.object.clock()
        ],
    });

    // Sign and execute the transaction
    const result = await client.signAndExecuteTransaction({
        transaction: start_universe_tx,
        signer: keypair,
        requestType: 'WaitForEffectsCert',
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showReturnValues: true,
        },
    });

    console.log('Universe started successfully!');
    console.log('Transaction digest:', result.digest);
    
    // Extract created object IDs from the transaction result
    const createdObjects = result.objectChanges?.filter(change => change.type === 'created') || [];
    
    if (createdObjects.length !== 5) {
        throw new Error(`Expected 5 created objects (Universe, UniverseCreatorCap, 3x UniverseElementSource), but found ${createdObjects.length}`);
    }
    
    console.log('Created objects:', createdObjects);
    
    // Identify objects by their types
    let universeId, universeCapId, erbElementSourceId, lanElementSourceId, thoElementSourceId;
    
    for (const obj of createdObjects) {
        const objectType = obj.objectType;
        
        if (objectType.includes('::universe::Universe') && !objectType.includes('UniverseCreatorCap') && !objectType.includes('UniverseElementSource')) {
            universeId = obj.objectId;
        } else if (objectType.includes('UniverseCreatorCap')) {
            universeCapId = obj.objectId;
        } else if (objectType.includes('UniverseElementSource') && objectType.includes('::erbium::ERBIUM>')) {
            erbElementSourceId = obj.objectId;
        } else if (objectType.includes('UniverseElementSource') && objectType.includes('::lanthanum::LANTHANUM>')) {
            lanElementSourceId = obj.objectId;
        } else if (objectType.includes('UniverseElementSource') && objectType.includes('::thorium::THORIUM>')) {
            thoElementSourceId = obj.objectId;
        }
    }
    
    // Validate all objects were found
    if (!universeId || !universeCapId || !erbElementSourceId || !lanElementSourceId || !thoElementSourceId) {
        throw new Error('Could not identify all required objects from transaction result');
    }
    
    console.log('Universe objects extracted:');
    console.log(`${name.toUpperCase()}_UNIVERSE_ID:`, universeId);
    console.log(`${name.toUpperCase()}_UNIVERSE_CAP_ID:`, universeCapId);
    console.log(`${name.toUpperCase()}_ERB_ELEMENT_SOURCE_ID:`, erbElementSourceId);
    console.log(`${name.toUpperCase()}_LAN_ELEMENT_SOURCE_ID:`, lanElementSourceId);
    console.log(`${name.toUpperCase()}_THO_ELEMENT_SOURCE_ID:`, thoElementSourceId);
    
    // Prepare variable names
    const universeNameUpper = name.toUpperCase();
    
    // Update CLI .env file (includes all objects including UniverseCreatorCap)
    console.log('\nUpdating CLI .env file...');
    updateEnvFile({
        [`${universeNameUpper}_UNIVERSE_ID`]: universeId,
        [`${universeNameUpper}_UNIVERSE_CAP_ID`]: universeCapId,
        [`${universeNameUpper}_ERB_ELEMENT_SOURCE_ID`]: erbElementSourceId,
        [`${universeNameUpper}_LAN_ELEMENT_SOURCE_ID`]: lanElementSourceId,
        [`${universeNameUpper}_THO_ELEMENT_SOURCE_ID`]: thoElementSourceId
    });
    
    // Update web .env file (excludes UniverseCreatorCap)
    console.log('Updating web .env file...');
    updateWebEnvFile({
        [`VITE_${universeNameUpper}_UNIVERSE_ID_DEV`]: universeId,
        [`VITE_${universeNameUpper}_ERB_ELEMENT_SOURCE_ID_DEV`]: erbElementSourceId,
        [`VITE_${universeNameUpper}_LAN_ELEMENT_SOURCE_ID_DEV`]: lanElementSourceId,
        [`VITE_${universeNameUpper}_THO_ELEMENT_SOURCE_ID_DEV`]: thoElementSourceId
    });
    
    // Update tx-digests.json file
    updateTxDigestsFile(`start-universe-${name.toLowerCase()}`, result.digest);
    
    console.log(`\n✅ Universe "${name}" created and .env files updated successfully!`);
    console.log('CLI (.env):');
    console.log(`  ${universeNameUpper}_UNIVERSE_ID=${universeId}`);
    console.log(`  ${universeNameUpper}_UNIVERSE_CAP_ID=${universeCapId}`);
    console.log(`  ${universeNameUpper}_ERB_ELEMENT_SOURCE_ID=${erbElementSourceId}`);
    console.log(`  ${universeNameUpper}_LAN_ELEMENT_SOURCE_ID=${lanElementSourceId}`);
    console.log(`  ${universeNameUpper}_THO_ELEMENT_SOURCE_ID=${thoElementSourceId}`);
    console.log('\nWeb (.env):');
    console.log(`  VITE_${universeNameUpper}_UNIVERSE_ID_DEV=${universeId}`);
    console.log(`  VITE_${universeNameUpper}_ERB_ELEMENT_SOURCE_ID_DEV=${erbElementSourceId}`);
    console.log(`  VITE_${universeNameUpper}_LAN_ELEMENT_SOURCE_ID_DEV=${lanElementSourceId}`);
    console.log(`  VITE_${universeNameUpper}_THO_ELEMENT_SOURCE_ID_DEV=${thoElementSourceId}`);
    
    return result;
}

// Open universe transaction function
export async function openUniverse({ universeCap, universe }) {
    // Validate parameters
    if (!universeCap || typeof universeCap !== 'string') {
        throw new Error('Universe capability ID is required and must be a string');
    }
    if (!universe || typeof universe !== 'string') {
        throw new Error('Universe ID is required and must be a string');
    }

    // Validate that all required environment variables are set
    const requiredEnvVars = {
        TRADE_WARS_PKG,
        TRADE_WARS_ID,
        TRADE_WARS_INFO
    };
    
    for (const [name, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
            throw new Error(`Missing required environment variable: ${name}`);
        }
    }
    
    console.log('Using environment variables:');
    console.log('TRADE_WARS_ID:', TRADE_WARS_ID);
    console.log('TRADE_WARS_INFO:', TRADE_WARS_INFO);
    console.log('Universe Cap:', universeCap);
    console.log('Universe ID:', universe);
    
    const { client, keypair } = getClientAndKeypair();
    
    const open_universe_tx = new Transaction();
    
    // Construct the method name string
    let openUniverseCall = TRADE_WARS_PKG+'::trade_wars::open_universe';

    // Add a moveCall to the transaction
    open_universe_tx.moveCall({
        target: openUniverseCall,
        arguments: [
            open_universe_tx.object(TRADE_WARS_ID),
            open_universe_tx.object(universeCap), 
            open_universe_tx.object(TRADE_WARS_INFO), 
            open_universe_tx.object(universe)
        ],
    });

    // Sign and execute the transaction
    const result = await client.signAndExecuteTransaction({
        transaction: open_universe_tx,
        signer: keypair,
        requestType: 'WaitForLocalExecution',
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showReturnValues: true,
        },
    });

    console.log('Universe opened successfully!');
    console.log('Transaction digest:', result.digest);
    
    // Update tx-digests.json file
    updateTxDigestsFile('open-universe', result.digest);
    
    return result;
}

// Close universe transaction function
export async function closeUniverse({ universeCap, universe }) {
    // Validate parameters
    if (!universeCap || typeof universeCap !== 'string') {
        throw new Error('Universe capability ID is required and must be a string');
    }
    if (!universe || typeof universe !== 'string') {
        throw new Error('Universe ID is required and must be a string');
    }

    // Validate that all required environment variables are set
    const requiredEnvVars = {
        TRADE_WARS_PKG,
        TRADE_WARS_ID,
        TRADE_WARS_INFO
    };
    
    for (const [name, value] of Object.entries(requiredEnvVars)) {
        if (!value) {
            throw new Error(`Missing required environment variable: ${name}`);
        }
    }
    
    console.log('Using environment variables:');
    console.log('TRADE_WARS_ID:', TRADE_WARS_ID);
    console.log('TRADE_WARS_INFO:', TRADE_WARS_INFO);
    console.log('Universe Cap:', universeCap);
    console.log('Universe ID:', universe);
    
    const { client, keypair } = getClientAndKeypair();
    
    const close_universe_tx = new Transaction();
    
    // Construct the method name string
    let closeUniverseCall = TRADE_WARS_PKG+'::trade_wars::close_universe';

    // Add a moveCall to the transaction
    close_universe_tx.moveCall({
        target: closeUniverseCall,
        arguments: [
            close_universe_tx.object(TRADE_WARS_ID),
            close_universe_tx.object(universeCap), 
            close_universe_tx.object(TRADE_WARS_INFO), 
            close_universe_tx.object(universe)
        ],
    });

    // Sign and execute the transaction
    const result = await client.signAndExecuteTransaction({
        transaction: close_universe_tx,
        signer: keypair,
        requestType: 'WaitForLocalExecution',
        options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showReturnValues: true,
        },
    });

    console.log('Universe closed successfully!');
    console.log('Transaction digest:', result.digest);
    
    // Update tx-digests.json file
    updateTxDigestsFile('close-universe', result.digest);
    
    return result;
}
