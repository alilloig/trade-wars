#!/usr/bin/env node

import { readFileSync } from 'fs';
import { glob } from 'glob';

async function verifyEnvironmentVariables() {
  try {
    console.log('🔍 Verifying environment variables in build...\n');

    // Read .env file
    const envContent = readFileSync('.env', 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      }
    });

    // Find built JS files
    const jsFiles = await glob('dist/assets/*.js');
    if (jsFiles.length === 0) {
      throw new Error('No JS files found in dist/assets/. Did you run npm run build?');
    }

    const jsContent = jsFiles.map(file => readFileSync(file, 'utf8')).join('');

    console.log('📋 Environment Variables Status:\n');

    let allFound = true;
    Object.entries(envVars).forEach(([key, value]) => {
      if (key.startsWith('VITE_')) {
        const found = jsContent.includes(value);
        const status = found ? '✅' : '❌';
        console.log(`${status} ${key}: ${found ? 'EMBEDDED' : 'MISSING'}`);
        if (found) {
          console.log(`   Value: ${value}`);
        }
        if (!found) allFound = false;
        console.log('');
      }
    });

    console.log('📊 Summary:');
    if (allFound) {
      console.log('✅ All environment variables successfully embedded in build!');
      console.log('🚀 Your app is ready for Walrus deployment!');
    } else {
      console.log('❌ Some environment variables are missing from the build.');
      console.log('💡 Try running "npm run build" again.');
    }

  } catch (error) {
    console.error('❌ Error verifying environment variables:', error.message);
    process.exit(1);
  }
}

verifyEnvironmentVariables(); 