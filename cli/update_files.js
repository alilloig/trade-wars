import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Function to update tx-digests.json file
export function updateTxDigestsFile(transactionName, digest) {
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

// Function to update .env file with new values
export function updateEnvFile(newValues) {
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

// Function to update web .env file with new values
export function updateWebEnvFile(newValues) {
    const webEnvPath = path.resolve('../web/.env');
    let envContent = '';
    
    try {
        envContent = fs.readFileSync(webEnvPath, 'utf8');
    } catch (error) {
        console.log('Creating new web .env file...');
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
    
    fs.writeFileSync(webEnvPath, newEnvContent);
    console.log('Updated web .env file with new package and object IDs');
}