#!/usr/bin/env node

import { program } from "commander";
import {sources, universe} from './transactions.js';

program
  .version("1.0.0")
  .description("Trade Wars Admin CLI");

  program
  .command('create-sources')
  .description('Create element sources')
  .action(() => {
    console.log(sources);
  });

  program
  .command('start-universe')
  .description('Start a new universe')
  .action(() => {
    console.log(universe);
  });


program.parse(process.argv);