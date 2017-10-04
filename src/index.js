// @flow

import type { PackageAtVersion, PacoteOptions } from './types';

const getAllDependencies = require('./get-dependencies');
const getLatestDependencies = require('./get-latest-dependencies');
const { resolveDependencies, formatGraphWithoutCircularDeps } = require('./format-dependencies');
const _ = require('lodash');

function buildGraph(rootPackage: PackageAtVersion, pacoteOptions: ?PacoteOptions) {
  return getAllDependencies(rootPackage, pacoteOptions).then(result => (
    getLatestDependencies(_.uniq(result.dependencies.map(npmPackage => npmPackage.name)))
      .then(latestVersions => (
        formatGraphWithoutCircularDeps(
          { name: rootPackage.name, version: result.resolvedDependencies[`${rootPackage.name}@${rootPackage.version}`] },
          resolveDependencies(result),
          latestVersions,
        )
      ))
  ));
}

module.exports = buildGraph;
