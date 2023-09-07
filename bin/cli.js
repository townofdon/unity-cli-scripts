#!/usr/bin/env node

import 'dotenv/config'
import yargs from 'yargs/yargs';

import { versionCommand } from '../cmd/version.js'
import { deployCommand } from '../cmd/deploy.js'

yargs(process.argv.slice(2))
  .scriptName("./bin/cli.js")
  .command(versionCommand.command, versionCommand.desc, versionCommand.builder, versionCommand.handler)
  .command(deployCommand.command, deployCommand.desc, deployCommand.builder, deployCommand.handler)
  .help()
  .argv
