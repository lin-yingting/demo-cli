#!/usr/bin/env node
const program = require('commander')
const myhelp = require('../lib/core/help')
const myCommander = require('../lib/core/commander')

myhelp(program)
myCommander(program)

program.parse(process.argv)