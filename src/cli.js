#!/usr/bin/env node
/* eslint-disable no-console, no-unused-expressions, prefer-template */

const untildify = require('untildify');
const fs = require('fs');
const meow = require('meow');
const chalk = require('chalk');
const npa = require('npm-package-arg');
const semver = require('semver');
const buildGraph = require('./index.js');

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

const dependencyColours = {
  latest: chalk.bold.green,
  patch: chalk.bold.blue,
  minor: chalk.bold.yellow,
  major: chalk.bold.red,
};

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

function buildBranch(depth, hasChildren, isLastChild, hasLastParent) {
  if (depth === 0) {
    return '';
  }

  let base = '│ '.repeat(depth - 1);
  const connector = isLastChild ? '└─' : '├─';
  const head = hasChildren ? '┬ ' : '─ ';

  if (hasLastParent) {
    base = `${base.slice(0, -2)}  `;
  }

  return base + connector + head;
}

function outOfDate(version, latestVersion) {
  try {
    if (version === latestVersion) {
      return 'latest';
    } else if (semver.major(version) !== semver.major(latestVersion)) {
      return 'major';
    } else if (semver.minor(version) !== semver.minor(latestVersion)) {
      return 'minor';
    } else if (semver.patch(version) !== semver.patch(latestVersion)) {
      return 'patch';
    }
    return 'tag';
  } catch (e) {
    return 'unmatched';
  }
}

function printLine(graph, depth, lastChild = false, hasLastParent = false) {
  const branch = buildBranch(
    depth,
    graph.children && graph.children.length > 0,
    lastChild,
    hasLastParent,
  );

  const latest = graph.version !== graph.latestVersion
    ? chalk.reset.dim(` -- latest: ${graph.latestVersion}`)
    : '';

  const versionStatus = outOfDate(graph.version, graph.latestVersion);
  const versionColour = dependencyColours[versionStatus]
    ? dependencyColours[versionStatus]
    : chalk.bold.red;

  console.log(
    chalk.dim(branch)
    + chalk.reset.white.bold(graph.name)
    + versionColour('@' + graph.version)
    + latest,
  );
}

function printGraph(graph, depth, lastChild = false, hasLastParent = false) {
  printLine(graph, depth, lastChild, hasLastParent);

  graph.children && graph.children.forEach((child, index) => {
    printGraph(child, depth + 1, graph.children.length - 1 === index, lastChild);
  });
}

const packageAtVersion = validateAndParse(cli.input);

if (packageAtVersion instanceof Error) {
  console.error(packageAtVersion.message);
  process.exit(1);
}

buildGraph(packageAtVersion, pacoteOptions).then((res) => {
  printGraph(res, 0);
});
