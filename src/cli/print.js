/* eslint-disable no-console, no-unused-expressions, prefer-template */
const chalk = require('chalk');
const semver = require('semver');
const printTree = require('print-tree');

const dependencyColours = {
  latest: chalk.bold.green,
  patch: chalk.bold.blue,
  minor: chalk.bold.yellow,
  major: chalk.bold.red,
};

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

function printLine(graph, branch) {
  const latest = graph.version !== graph.latestVersion
    ? chalk.reset.dim(` latest: ${graph.latestVersion}`)
    : '';

  const versionStatus = outOfDate(graph.version, graph.latestVersion);
  const versionColour = dependencyColours[versionStatus]
    ? dependencyColours[versionStatus]
    : chalk.bold.red;

  console.log(chalk.dim(branch)
    + chalk.reset.white.bold(graph.name)
    + versionColour('@' + graph.version)
    + latest);
}

function printGraph(graph) {
  printTree(
    graph,
    printLine,
    node => node.children,
  );
}

module.exports = printGraph;
