#!/usr/bin/env node

import 'dotenv/config'
import yargs from 'yargs/yargs';

import { versionCommand } from '../cmd/version.js'
import { deployCommand } from '../cmd/deploy.js'
import { webglCommand } from '../cmd/webgl.js'
import { uniqGuidCommand } from '../cmd/uniqGuid.js'

yargs(process.argv.slice(2))
  .scriptName("./bin/cli.js")
  .command(versionCommand.command, versionCommand.desc, versionCommand.builder, versionCommand.handler)
  .command(deployCommand.command, deployCommand.desc, deployCommand.builder, deployCommand.handler)
  .command(webglCommand.command, webglCommand.desc, webglCommand.builder, webglCommand.handler)
  .command(uniqGuidCommand.command, uniqGuidCommand.desc, uniqGuidCommand.builder, uniqGuidCommand.handler)
  .help()
  .argv
