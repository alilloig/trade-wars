import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { updateEnvFile, updateWebEnvFile, updateTxDigestsFile } from './update_files.js';

dotenv.config();

// Function to parse publish output and extract object IDs
function parsePublishOutput(output) {
    const result = {
        packageId: null,
        transactionDigest: null,
        createdObjects: []
    };
    
    // Extract transaction digest
    const digestMatch = output.match(/Transaction Digest:\s*([A-Za-z0-9]+)/);
    if (digestMatch) {
        result.transactionDigest = digestMatch[1];
    }
    
    // Extract package ID from Published Objects section
    const packageMatch = output.match(/PackageID:\s*(0x[a-fA-F0-9]+)/);
    if (packageMatch) {
        result.packageId = packageMatch[1];
    }
    
    // Extract created objects from Created Objects section
    const objectPattern = /ObjectID:\s*(0x[a-fA-F0-9]+)[\s\S]*?ObjectType:\s*([^\s]+)/g;
    let match;
    while ((match = objectPattern.exec(output)) !== null) {
        result.createdObjects.push({
            objectId: match[1],
            objectType: match[2]
        });
    }
    
    return result;
}

// Function to map object types to environment variable names
function mapObjectTypeToEnvVar(objectType, packageId) {
    // Handle the package-specific types
    const packagePrefix = packageId.replace('0x', '');
    
    if (objectType.includes('::trade_wars::TradeWars') && !objectType.includes('Info')) {
        return 'TRADE_WARS_ID';
    } else if (objectType.includes('::trade_wars::TradeWarsInfo')) {
        return 'TRADE_WARS_INFO';
    } else if (objectType.includes('::trade_wars::GameAdminCap')) {
        return 'ADM_CAP_ID';
    } else if (objectType.includes('::coin::TreasuryCap') && objectType.includes('::erbium::ERBIUM')) {
        return 'ERB_CAP_ID';
    } else if (objectType.includes('::coin::TreasuryCap') && objectType.includes('::lanthanum::LANTHANUM')) {
        return 'LAN_CAP_ID';
    } else if (objectType.includes('::coin::TreasuryCap') && objectType.includes('::thorium::THORIUM')) {
        return 'THO_CAP_ID';
    }
    
    return null;
}

// Function to execute sui client publish and parse output
function executePublish(packagePath = '../move') {
    return new Promise((resolve, reject) => {
        console.log('Publishing Move package...');
        console.log(`Package path: ${packagePath}`);
        
        const suiProcess = spawn('sui', ['client', 'publish', packagePath], {
            stdio: ['inherit', 'pipe', 'pipe'],
            cwd: process.cwd()
        });
        
        let stdout = '';
        let stderr = '';
        
        suiProcess.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            // Stream output to console in real-time
            process.stdout.write(output);
        });
        
        suiProcess.stderr.on('data', (data) => {
            const output = data.toString();
            stderr += output;
            // Stream error output to console in real-time
            process.stderr.write(output);
        });
        
        suiProcess.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`sui client publish failed with exit code ${code}\n${stderr}`));
            }
        });
        
        suiProcess.on('error', (error) => {
            reject(new Error(`Failed to start sui client publish: ${error.message}`));
        });
    });
}

// Publish Move package function
export async function publishPackage({ packagePath = '../move' } = {}) {
    try {
        // Validate that the package directory exists
        const resolvedPackagePath = path.resolve(packagePath);
        if (!fs.existsSync(resolvedPackagePath)) {
            throw new Error(`Package directory does not exist: ${resolvedPackagePath}`);
        }
        
        // Check for Move.toml file
        const moveTomlPath = path.join(resolvedPackagePath, 'Move.toml');
        if (!fs.existsSync(moveTomlPath)) {
            throw new Error(`Move.toml file not found in: ${resolvedPackagePath}`);
        }
        
        console.log('Validating package structure...');
        console.log(`Found Move.toml at: ${moveTomlPath}`);
        
        // Execute the publish command
        const { stdout } = await executePublish(packagePath);
        
        // Parse the output to extract important information
        const publishResult = parsePublishOutput(stdout);
        
        if (!publishResult.packageId) {
            throw new Error('Failed to extract package ID from publish output');
        }
        
        if (!publishResult.transactionDigest) {
            throw new Error('Failed to extract transaction digest from publish output');
        }
        
        console.log('\n=== PUBLISH SUCCESSFUL ===');
        console.log('Package ID:', publishResult.packageId);
        console.log('Transaction Digest:', publishResult.transactionDigest);
        console.log('Created Objects:', publishResult.createdObjects.length);
        
        // Map created objects to environment variables
        const envUpdates = {
            TRADE_WARS_PKG: publishResult.packageId
        };
        
        const webEnvUpdates = {
            VITE_TRADE_WARS_PKG_DEV: publishResult.packageId
        };
        
        // Process each created object
        publishResult.createdObjects.forEach((obj, index) => {
            console.log(`\nObject ${index + 1}:`);
            console.log(`  ID: ${obj.objectId}`);
            console.log(`  Type: ${obj.objectType}`);
            
            const envVarName = mapObjectTypeToEnvVar(obj.objectType, publishResult.packageId);
            if (envVarName) {
                envUpdates[envVarName] = obj.objectId;
                console.log(`  → Mapped to: ${envVarName}`);
                
                // Add to web env updates for specific types
                if (envVarName === 'TRADE_WARS_ID') {
                    webEnvUpdates.VITE_TRADE_WARS_ID_DEV = obj.objectId;
                } else if (envVarName === 'TRADE_WARS_INFO') {
                    webEnvUpdates.VITE_TRADE_WARS_INFO_DEV = obj.objectId;
                }
            } else {
                console.log('  → No mapping found for this object type');
            }
        });
        
        // Update CLI .env file
        console.log('\nUpdating CLI .env file...');
        updateEnvFile(envUpdates);
        
        // Update web .env file
        console.log('Updating web .env file...');
        updateWebEnvFile(webEnvUpdates);
        
        // Update tx-digests.json file
        updateTxDigestsFile('publish-package', publishResult.transactionDigest);
        
        console.log('\n=== ENVIRONMENT VARIABLES UPDATED ===');
        console.log('CLI (.env):');
        Object.entries(envUpdates).forEach(([key, value]) => {
            console.log(`  ${key}=${value}`);
        });
        
        console.log('\nWeb (.env):');
        Object.entries(webEnvUpdates).forEach(([key, value]) => {
            console.log(`  ${key}=${value}`);
        });
        
        console.log('\n✅ Package published and environment files updated successfully!');
        
        return {
            packageId: publishResult.packageId,
            transactionDigest: publishResult.transactionDigest,
            createdObjects: publishResult.createdObjects,
            envUpdates,
            webEnvUpdates
        };
        
    } catch (error) {
        console.error('Error publishing package:', error.message);
        throw error;
    }
}