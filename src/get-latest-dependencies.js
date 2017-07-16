// @flow

import type { PackageAtVersion, PackageWithDeps, Manifest, PackageVersionMap } from './types';

const { getPackageMeta } = require('./util');

const pacote = require('pacote');

function getLatestDependencies(
  packages: Array<string>,
  pacoteOptions: Object = {},
): Promise<PackageVersionMap> {
  function getPackage(npmPackage: PackageAtVersion): Promise<Manifest> {
    const spec = `${npmPackage.name}@${npmPackage.version}`;

    return pacote.manifest(spec, pacoteOptions);
  }

  function getPackageDependencies(npmPackageName: string): Promise<PackageWithDeps> {
    const packageAtVersion = { name: npmPackageName, version: 'latest' };

    return getPackage(packageAtVersion).then(manifest => (
      getPackageMeta(packageAtVersion, manifest)
    ));
  }

  function getLatest(npmPackages: Array<string>): Promise<Array<PackageWithDeps>> {
    return Promise.all(npmPackages.map(npmPackage => getPackageDependencies(npmPackage)));
  }

  return getLatest(packages)
  .then(latestPackages => (
    latestPackages.reduce((acc, npmPackage) => {
      acc[npmPackage.name] = npmPackage.version;
      return acc;
    }, {})
  ));
}

module.exports = getLatestDependencies;
