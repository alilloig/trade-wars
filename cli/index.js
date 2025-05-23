#!/usr/bin/env node

import { program } from "commander";
import { createElementSources, startUniverse } from './transactions.js';

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

program.parse(process.argv);