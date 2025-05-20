#!/usr/bin/env node

import { program } from "commander";
import {balance} from './transactions.js';

program
  .version("1.0.0")
  .description("Trade Wars Admin CLI");

  program
  .command('create-sources')
  .description('Create element sources')
  .action(() => {
    console.log('create-sources');
  });

  program
  .command('start-universe')
  .description('Start a new universe')
  .action(() => {
    console.log('start-universe');
  });

  program
  .command('balance')
  .description('Get balance')
  .action(() => {
    console.log(balance);
  });

program.parse(process.argv);