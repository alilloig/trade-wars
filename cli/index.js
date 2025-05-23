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
  .action(async () => {
    try {
      console.log('Starting universe...');
      const result = await startUniverse();
      console.log('Universe started with digest:', result.digest);
    } catch (error) {
      console.error('Error starting universe:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);