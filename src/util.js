// @flow

import type { PackageAtVersion, PackageWithDeps, Manifest } from './types';

function getPackageMeta(
  npmPackage: PackageAtVersion,
  manifest: Manifest,
): PackageWithDeps {
  return {
    name: npmPackage.name,
    version: manifest.version,
    deps: manifest.dependencies,
    devDeps: manifest.devDependencies,
    peerDeps: manifest.peerDependencies,
  };
}

module.exports = {
  getPackageMeta,
};
