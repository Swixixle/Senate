#!/usr/bin/env node
import { Command } from 'commander';
import init from './commands/init';
import ingestVotes from './commands/ingest_votes';
import verify from './commands/verify';

const program = new Command();
program
  .command('init')
  .description('Initialize senators dataset')
  .action(init);

program
  .command('ingest_votes')
  .description('Ingest voting events')
  .argument('<inputPath>', 'Path to vote ingestion JSON input file')
  .action((inputPath: string) => ingestVotes({ inputPath }));

program
  .command('verify')
  .description('Verify all receipts')
  .action(verify);

program.parse(process.argv);
