#!/usr/bin/env node
/* eslint-disable no-console */

const untildify = require('untildify');
const fs = require('fs');
const meow = require('meow');
const npa = require('npm-package-arg');
const buildGraph = require('../index.js');
const printGraph = require('./print.js');

const npmrcPath = untildify('~/.npmrc');
const npmrc = fs.readFileSync(npmrcPath, 'utf8');
const tokenMatch = npmrc.match(/.*authToken=(.*)/);
const token = tokenMatch && tokenMatch[1];

const pacoteOptions = {
  auth: {
    token,
  },
};

const cli = meow(`
  Usage
    $ jd <package@version | package>

  Example
    $ jd johnny-dependency@latest

`);

function parsePackage(npmPackage) {
  const parsedPackage = npa(npmPackage);
  return {
    name: parsedPackage.name,
    version: parsedPackage.rawSpec,
  };
}

function validateAndParse(input) {
  if (input.length !== 1) {
    if (input.length === 0) {
      return new Error('An argument (package@version) is required. Run johnny-dependency --help for more info');
    }
    return new Error('johnny-dependency only takes one argument. Run johnny-dependency --help for more info');
  }

  try {
    return parsePackage(input[0]);
  } catch (error) {
    return new Error('The package name is either invalid or not supported. Sorry : (');
  }
}

const packageAtVersion = validateAndParse(cli.input);

if (packageAtVersion instanceof Error) {
  console.error(packageAtVersion.message);
  process.exit(1);
}

buildGraph(packageAtVersion, pacoteOptions).then((res) => {
  printGraph(res, '');
});
