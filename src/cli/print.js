/* eslint-disable no-console, no-unused-expressions, prefer-template */
const chalk = require('chalk');
const semver = require('semver');

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

  console.log(
    chalk.dim(branch)
    + chalk.reset.white.bold(graph.name)
    + versionColour('@' + graph.version)
    + latest,
  );
}

function printGraph(graph, branch) {
  const isGraphHead = branch.length === 0;
  let branchHead = '';

  if (!isGraphHead) {
    branchHead = graph.children && graph.children.length !== 0 ? '┬ ' : '─ ';
  }

  printLine(graph, `${branch}${branchHead}`);

  if (graph.children) {
    let baseBranch = branch;

    if (!isGraphHead) {
      const isChildOfLastBranch = branch.slice(-2) === '└─';
      baseBranch = branch.slice(0, -2) + (isChildOfLastBranch ? '  ' : '| ');
    }

    const nextBranch = baseBranch + '├─';
    const lastBranch = baseBranch + '└─';

    graph.children.forEach((child, index) => {
      printGraph(child, graph.children.length - 1 === index ? lastBranch : nextBranch);
    });
  }
}

module.exports = printGraph;
