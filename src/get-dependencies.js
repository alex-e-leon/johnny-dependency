// @flow

import type { PackageVersionMap, PackageAtVersion, PackageWithDeps, PacoteOptions, Manifest } from './types';

const pacote = require('pacote');
const rxjs = require('rxjs');
const npa = require('npm-package-arg');
const { getPackageMeta } = require('./util');

function flattenDependencies(deps: PackageVersionMap): Array<PackageAtVersion> {
  return Object.keys(deps).reduce((acc, name) => {
    const version = deps[name];

    return acc.concat({ name, version });
  }, []);
}

function validateDeps(packages: Array<PackageAtVersion>): Array<PackageAtVersion> {
  return packages.filter((npmPackage) => {
    const { type } = npa(`${npmPackage.name}@${npmPackage.version}`);

    return type === 'tag' || type === 'version' || type === 'range';
  });
}

function getDependencies(
  thePackage: PackageAtVersion,
  pacoteOptions: ?PacoteOptions = {},
): Promise<{
  dependencies: Array<PackageWithDeps>,
  resolvedDependencies: { [string]: string },
}> {
  const resolvedDependencies = {};

  function getPackage(npmPackage: PackageAtVersion): Promise<Manifest> {
    const spec = `${npmPackage.name}@${npmPackage.version}`;

    return pacote.manifest(spec, pacoteOptions);
  }

  function getDirectDependencies(npmPackage: PackageAtVersion, manifest: Manifest) {
    const key = `${npmPackage.name}@${npmPackage.version}`;

    if (!(key in resolvedDependencies)) {
      resolvedDependencies[key] = manifest.version;

      const dependencies = validateDeps(flattenDependencies(manifest.dependencies));

      return rxjs.Observable.merge(
        rxjs.Observable.of(getPackageMeta(npmPackage, manifest)),

        rxjs.Observable.from(dependencies)
          .mergeMap(dependency => (
            getPackage(dependency).then(depManifest => (
              { dependency, depManifest }
            ))
          ))
          .mergeMap(({ dependency, depManifest }) => (
            getDirectDependencies(dependency, depManifest)
          )),
      );
    }
    return rxjs.Observable.empty();
  }

  function getAllDependencies(npmPackage: PackageAtVersion): Promise<{
    dependencies: Array<PackageWithDeps>,
    resolvedDependencies: { [string]: string },
  }> {
    return new Promise((resolve) => {
      getPackage(npmPackage).then((manifest) => {
        getDirectDependencies(npmPackage, manifest)
          .reduce((acc, curr) => acc.concat(curr), [])
          .subscribe((dependencies) => { resolve({ dependencies, resolvedDependencies }); });
      });
    });
  }

  return getAllDependencies(thePackage);
}

module.exports = getDependencies;
