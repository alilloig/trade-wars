#!/usr/bin/env node

import { program } from "commander";
import { createElementSources, startUniverse, openUniverse, closeUniverse, publishPackage } from './transactions.js';

program
  .version("1.0.0")
  .description("Trade Wars Admin CLI");

program
  .command('create-sources')
  .description('Create element sources')
  .action(async () => {
    try {
      console.log('Creating element sources...');
      const result = await createElementSources();
      console.log('Sources created with digest:', result.digest);
    } catch (error) {
      console.error('Error creating sources:', error.message);
      process.exit(1);
    }
  });

program
  .command('start-universe')
  .description('Start a new universe (requires sources to be created first)')
  .requiredOption('--name <name>', 'Universe name')
  .requiredOption('--galaxies <number>', 'Number of galaxies (1-255)', (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 255) {
      throw new Error('Galaxies must be a number between 1 and 255');
    }
    return num;
  })
  .requiredOption('--systems <number>', 'Number of systems (1-255)', (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 255) {
      throw new Error('Systems must be a number between 1 and 255');
    }
    return num;
  })
  .requiredOption('--planets <number>', 'Number of planets (1-255)', (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 255) {
      throw new Error('Planets must be a number between 1 and 255');
    }
    return num;
  })
  .action(async (options) => {
    try {
      console.log('Starting universe...');
      const result = await startUniverse({
        name: options.name,
        galaxies: options.galaxies,
        systems: options.systems,
        planets: options.planets
      });
      console.log('Universe started with digest:', result.digest);
    } catch (error) {
      console.error('Error starting universe:', error.message);
      process.exit(1);
    }
  });

program
  .command('open-universe')
  .description('Open a universe for registration')
  .requiredOption('--universe-cap <id>', 'Universe creator capability ID')
  .requiredOption('--universe <id>', 'Universe ID')
  .action(async (options) => {
    try {
      console.log('Opening universe...');
      const result = await openUniverse({
        universeCap: options.universeCap,
        universe: options.universe
      });
      console.log('Universe opened with digest:', result.digest);
    } catch (error) {
      console.error('Error opening universe:', error.message);
      process.exit(1);
    }
  });

program
  .command('close-universe')
  .description('Close a universe for registration')
  .requiredOption('--universe-cap <id>', 'Universe creator capability ID')
  .requiredOption('--universe <id>', 'Universe ID')
  .action(async (options) => {
    try {
      console.log('Closing universe...');
      const result = await closeUniverse({
        universeCap: options.universeCap,
        universe: options.universe
      });
      console.log('Universe closed with digest:', result.digest);
    } catch (error) {
      console.error('Error closing universe:', error.message);
      process.exit(1);
    }
  });

program
  .command('publish')
  .description('Publish the Move package and update environment files')
  .option('--package-path <path>', 'Path to the Move package directory', '../move')
  .action(async (options) => {
    try {
      console.log('Publishing Move package...');
      const result = await publishPackage({
        packagePath: options.packagePath
      });
      console.log('\n🎉 Package published successfully!');
      console.log('Package ID:', result.packageId);
      console.log('Transaction Digest:', result.transactionDigest);
    } catch (error) {
      console.error('Error publishing package:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);