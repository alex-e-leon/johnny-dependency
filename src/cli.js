#!/usr/bin/env node

const untildify = require('untildify');
const fs = require('fs');
const buildGraph = require('./index.js');
const meow = require('meow');
const npa = require('npm-package-arg');

const npmrcPath = untildify('~/.npmrc');
const npmrc = fs.readFileSync(npmrcPath, 'utf8');
const tokenMatch = npmrc.match(/.*authToken=(.*)/);
const token = tokenMatch && tokenMatch[1];

const pacoteOptions = {
  auth: {
    token,
  },
};

function parsePackage(npmPackage) {
  const parsedPackage = npa(npmPackage);
  return {
    name: parsedPackage.name,
    version: parsedPackage.rawSpec,
  };
}

const cli = meow(`
  Usage
    $ jd <package@version | package>

  Examples
    $ jd johnny-dependency@latest
`);

buildGraph(parsePackage(cli.input[0]), pacoteOptions).then((res) => {
  // eslint-disable-next-line no-console
  console.log(res);
});
